import * as Sentry from '@sentry/react';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined'
      ? process.env
      : ({} as Record<string, string | undefined>);

/**
 * Third-party analytics, tracking, or tag manager domains whose script
 * execution or network loading failures should not pollute application telemetry.
 */
const THIRD_PARTY_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'challenges.cloudflare.com',
  'cloudflareinsights.com',
  'connect.facebook.net',
  'clarity.ms',
  'doubleclick.net',
  'googleadservices.com',
];

/**
 * Browser extension protocol prefixes.
 */
const EXTENSION_PROTOCOLS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'safari-web-extension://',
  'extension://',
  'ms-browser-extension://',
  'webkit-masked-url://',
];

/**
 * Transient network and chunk loading failure patterns (offline, DNS, adblocker).
 */
const NETWORK_ERROR_PATTERNS = [
  /^Failed to fetch$/i,
  /^NetworkError when attempting to fetch resource\.?$/i,
  /^Network ?Error$/i,
  /^Network request failed$/i,
  /^Load failed$/i,
  /^Fetch API cannot load/i,
  /^net::ERR_/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading (chunk|CSS chunk) [0-9]+ failed/i,
  /ChunkLoadError/i,
];

/**
 * Normal user cancellation / navigation abort patterns.
 */
const ABORT_ERROR_PATTERNS = [
  /The (user|operation) (aborted a request|was aborted)/i,
  /Signal is aborted without reason/i,
  /aborted by the user/i,
  /Fetch is aborted/i,
  /AbortError/i,
];

/**
 * Benign browser rendering / layout cycle observer notifications.
 */
const RESIZEOBSERVER_PATTERNS = [
  /ResizeObserver loop completed with undelivered notifications/i,
  /ResizeObserver loop limit exceeded/i,
  /ResizeObserver loop/i,
];

/**
 * Injected browser extension messaging communication errors.
 */
const EXTENSION_MESSAGE_PATTERNS = [
  /The message port closed before a response was received/i,
  /Receiving end does not exist/i,
  /Could not establish connection\. Receiving end does not exist/i,
  /Extension context invalidated/i,
  /A listener indicated an asynchronous response by returning true/i,
  /Cannot access contents of url/i,
];

function isExtensionUrl(url?: string): boolean {
  if (!url) return false;
  return EXTENSION_PROTOCOLS.some((proto) => url.startsWith(proto));
}

function isThirdPartyUrl(url?: string): boolean {
  if (!url) return false;
  return THIRD_PARTY_DOMAINS.some((domain) => url.includes(domain));
}

/**
 * Evaluates whether a captured error event is a false positive that should be suppressed.
 * Preserves genuine runtime exceptions, syntax errors, and unhandled business logic promise rejections.
 */
export function filterSentryEvent(
  event: Sentry.ErrorEvent,
  hint?: Sentry.EventHint
): Sentry.ErrorEvent | null {
  const originalException = hint?.originalException;

  // 1. Inspect originalException object if present
  if (originalException && typeof originalException === 'object') {
    const errorObj = originalException as {
      name?: string;
      message?: string;
      code?: number | string;
    };
    const errorName = errorObj.name || '';
    const errorMessage = errorObj.message || '';
    const errorCode = errorObj.code;

    // Suppress AbortError (e.g. user navigation during fetch)
    if (errorName === 'AbortError' || errorCode === 20) {
      return null;
    }
    if (ABORT_ERROR_PATTERNS.some((p) => p.test(errorMessage) || p.test(errorName))) {
      return null;
    }

    // Suppress transient network fetch failures
    if (NETWORK_ERROR_PATTERNS.some((p) => p.test(errorMessage) || p.test(errorName))) {
      return null;
    }

    // Suppress browser extension messaging failures
    if (EXTENSION_MESSAGE_PATTERNS.some((p) => p.test(errorMessage))) {
      return null;
    }

    // Suppress non-actionable ResizeObserver notifications
    if (RESIZEOBSERVER_PATTERNS.some((p) => p.test(errorMessage))) {
      return null;
    }
  }

  // 2. Inspect event exception values and messages
  const values = event.exception?.values || [];
  const primaryException = values[0];
  const exceptionType = primaryException?.type || '';
  const exceptionValue = primaryException?.value || '';
  const eventMessage = event.message || '';

  const allMessages = [eventMessage, exceptionValue, exceptionType].filter(Boolean);

  // Check Abort patterns
  if (allMessages.some((msg) => ABORT_ERROR_PATTERNS.some((p) => p.test(msg)))) {
    return null;
  }

  // Check Network patterns
  if (allMessages.some((msg) => NETWORK_ERROR_PATTERNS.some((p) => p.test(msg)))) {
    return null;
  }

  // Check ResizeObserver patterns
  if (allMessages.some((msg) => RESIZEOBSERVER_PATTERNS.some((p) => p.test(msg)))) {
    return null;
  }

  // Check Extension message patterns
  if (allMessages.some((msg) => EXTENSION_MESSAGE_PATTERNS.some((p) => p.test(msg)))) {
    return null;
  }

  // 3. Filter generic uninformative cross-origin "Script error." (third-party script load failure without CORS)
  const isScriptError = allMessages.some((msg) => /^Script error\.?$/i.test(msg.trim()));
  const frames = primaryException?.stacktrace?.frames || [];

  if (isScriptError && frames.length === 0) {
    return null;
  }

  // 4. Filter stack frames and transaction/culprit for extension or third-party origins
  const culprit = (event as { culprit?: string }).culprit || '';
  const transaction = event.transaction || '';
  if (
    isExtensionUrl(culprit) ||
    isThirdPartyUrl(culprit) ||
    isExtensionUrl(transaction) ||
    isThirdPartyUrl(transaction)
  ) {
    return null;
  }

  if (frames.length > 0) {
    // If any frame originates from a browser extension, suppress
    const hasExtensionFrame = frames.some(
      (f) => isExtensionUrl(f.filename) || isExtensionUrl(f.abs_path)
    );
    if (hasExtensionFrame) {
      return null;
    }

    // If all stack frames originate from known third-party scripts, suppress
    const allThirdParty = frames.every(
      (f) => isThirdPartyUrl(f.filename) || isThirdPartyUrl(f.abs_path)
    );
    if (allThirdParty) {
      return null;
    }
  }

  // Preserve all genuine application runtime exceptions and unhandled promise rejections
  return event;
}

/**
 * Initializes Sentry application monitoring.
 * Safe in SSR / static prerender and development environments.
 */
export function initSentry(): void {
  if (typeof window === 'undefined') return;

  const dsn = env.VITE_SENTRY_DSN;
  const environment = env.MODE || env.NODE_ENV || 'development';

  if (!dsn) {
    if (environment === 'development') {
      console.log('ℹ️ [Sentry] VITE_SENTRY_DSN not set; running in local monitoring bypass mode.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Tracing sample rate: 100% in staging/development, 20% in production
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    tracePropagationTargets: ['localhost', /^\//],
    // Session Replay sample rate
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      return filterSentryEvent(event, hint);
    },
    ignoreErrors: [
      'TypeError: Illegal invocation',
      /Illegal invocation/i,
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource.',
      /Loading chunk [0-9]+ failed/i,
    ],
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
    ],
  });
}

/**
 * Capture an error with custom diagnostic context.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  console.error('[App Error Captured]', error, context);
  if (typeof window !== 'undefined' && env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}

export { Sentry };
