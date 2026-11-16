import * as Sentry from '@sentry/react';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined'
      ? process.env
      : ({} as Record<string, string | undefined>);

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
