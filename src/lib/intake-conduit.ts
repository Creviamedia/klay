/**
 * Sovereign Intake Dossier Conduit (`src/lib/intake-conduit.ts`)
 *
 * Deep module that unifies lead capture and intake dossier transmission across all
 * frontend forms (SetupCalculator, KlayLeadForm, FinancialSliders, GoldenVisaQuiz).
 *
 * Encapsulates:
 * - Strict schema sanitization & phone trunk zero normalization
 * - Sovereign reference number generation (KLAY-2026-XXXX)
 * - Network retry with exponential backoff on transient failure
 * - Standardized error taxonomy & offline local fallback
 */

export interface RawIntakePayload {
  name: string;
  email: string;
  phone: string;
  dialCode?: string;
  budget?: string;
  jurisdiction?: string;
  activity?: string;
  timeline?: string;
  notes?: string;
  source?: string;
  variant?: string;
  visaCount?: number;
  officeType?: string;
  estimateAed?: number;
  estimateUsd?: number;
  options?: unknown;
  breakdown?: unknown;
  quizAnswers?: unknown;
  result?: unknown;
  [key: string]: unknown;
}

export interface IntakeResult {
  success: boolean;
  referenceNumber: string;
  error?: string;
  isFallback?: boolean;
}

/**
 * Normalizes phone numbers by stripping trunk zeros and joining with country dial code.
 */
export function normalizePhoneNumber(rawPhone: string, dialCode?: string): string {
  let cleaned = (rawPhone || '').trim();
  if (dialCode) {
    cleaned = cleaned.replace(/^0+/, '');
    return `${dialCode.trim()} ${cleaned}`.trim();
  }
  return cleaned;
}

/**
 * Generates an institutional sovereign reference number for fallback / tracking.
 */
export function generateSovereignReference(prefix: string = 'KLAY-2026'): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSuffix}`;
}

/**
 * Validates baseline intake requirements.
 */
export function validateIntakePayload(payload: RawIntakePayload): {
  isValid: boolean;
  error?: string;
} {
  if (!payload.name || !payload.name.trim()) {
    return { isValid: false, error: 'Please provide your full legal name.' };
  }
  if (!payload.email || !payload.email.trim() || !payload.email.includes('@')) {
    return { isValid: false, error: 'Please provide a valid corporate email address.' };
  }
  if (!payload.phone || !payload.phone.trim()) {
    return { isValid: false, error: 'Please provide a contact phone or WhatsApp number.' };
  }
  return { isValid: true };
}

export const BACKUP_LEAD_ENDPOINT = 'https://klay-consulting-staging.netlify.app/api/leads';
const STORAGE_KEY = 'klay_pending_intakes';

export function getCandidateEndpoints(customEndpoint?: string): string[] {
  if (customEndpoint) return [customEndpoint];
  const primary = (import.meta.env?.VITE_LEAD_API_ENDPOINT as string) || '/api/leads';
  const endpoints = [primary];
  if (primary !== BACKUP_LEAD_ENDPOINT) {
    endpoints.push(BACKUP_LEAD_ENDPOINT);
  }
  if (primary !== '/api/leads' && !endpoints.includes('/api/leads')) {
    endpoints.push('/api/leads');
  }
  return endpoints;
}

export function enqueueOfflineIntake(payload: unknown, referenceNumber: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({ payload, referenceNumber, queuedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    // Non-fatal
  }
}

export async function flushPendingIntakes(): Promise<number> {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return 0;

    const remaining: typeof list = [];
    let synced = 0;

    for (const item of list) {
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        if (res.ok) {
          synced++;
        } else {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    return synced;
  } catch {
    return 0;
  }
}

// Auto-sync pending intakes when browser comes online or during idle
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushPendingIntakes();
  });
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
      () => {
        void flushPendingIntakes();
      }
    );
  } else {
    setTimeout(() => {
      void flushPendingIntakes();
    }, 3000);
  }
}

/**
 * Deep transmission function: submits the intake dossier with multi-tier failover, retry, and sovereign fallback.
 */
export async function submitIntakeDossier(
  rawInput: RawIntakePayload,
  options: {
    endpoint?: string;
    maxRetries?: number;
    referencePrefix?: string;
  } = {}
): Promise<IntakeResult> {
  const validation = validateIntakePayload(rawInput);
  const fallbackRef = generateSovereignReference(options.referencePrefix || 'KLAY-2026');

  if (!validation.isValid) {
    return {
      success: false,
      referenceNumber: fallbackRef,
      error: validation.error,
    };
  }

  const phone = normalizePhoneNumber(rawInput.phone, rawInput.dialCode);
  const payload = {
    ...rawInput,
    name: rawInput.name.trim(),
    email: rawInput.email.trim(),
    phone,
    budget: rawInput.budget ? String(rawInput.budget).trim() : undefined,
    submittedAt: new Date().toISOString(),
  };

  const candidateEndpoints = getCandidateEndpoints(options.endpoint);
  const maxRetries = options.maxRetries ?? 1;

  for (const endpoint of candidateEndpoints) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && (data.success || data.leadId || data.referenceNumber)) {
          const referenceNumber = data.leadId || data.referenceNumber || fallbackRef;
          return {
            success: true,
            referenceNumber,
          };
        }

        // If server explicitly rejected with 400 validation error, do not retry other servers
        if (response.status === 400) {
          return {
            success: false,
            referenceNumber: fallbackRef,
            error:
              data.error || data.message || 'The advisory desk rejected this submission format.',
          };
        }

        // If server returned 429 or 5xx, retry if attempts remain on this endpoint
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((res) => setTimeout(res, 200 * attempt));
          continue;
        }
        break; // Move to next candidate endpoint
      } catch {
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((res) => setTimeout(res, 200 * attempt));
          continue;
        }
        break; // Move to next candidate endpoint
      }
    }
  }

  // All endpoints failed: safely preserve lead in offline queue
  enqueueOfflineIntake(payload, fallbackRef);

  return {
    success: true,
    referenceNumber: fallbackRef,
    isFallback: true,
  };
}
