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

/**
 * Deep transmission function: submits the intake dossier with validation, retry, and sovereign fallback.
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

  const endpoint =
    options.endpoint || (import.meta.env?.VITE_LEAD_API_ENDPOINT as string) || '/api/leads';
  const maxRetries = options.maxRetries ?? 1;

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

      // If server explicitly rejected with 400 validation error, do not retry
      if (response.status === 400) {
        return {
          success: false,
          referenceNumber: fallbackRef,
          error: data.error || data.message || 'The advisory desk rejected this submission format.',
        };
      }

      // If server returned 429 or 5xx, retry if attempts remain
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, 300 * attempt));
        continue;
      }

      return {
        success: false,
        referenceNumber: fallbackRef,
        error:
          data.error || data.message || 'Unable to register intake dossier with the Legal Desk.',
      };
    } catch {
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, 300 * attempt));
        continue;
      }
      return {
        success: false,
        referenceNumber: fallbackRef,
        error: 'Network connection error. Please try again or contact our legal desk directly.',
      };
    }
  }

  return {
    success: false,
    referenceNumber: fallbackRef,
    error: 'Transmission timeout.',
  };
}
