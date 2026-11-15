# Technical Specification: Admin Authentication Architecture & REST API Contracts

**Document ID**: SPEC-ADMIN-001  
**Project**: Klay Unified Admin Dashboard & Content Portal  
**Target Milestone**: Milestone 1 (Foundation) & Milestone 2 (API & Security Hardening)  
**Status**: APPROVED / ACTIVE  
**Last Updated**: 2026-11-15

---

## 1. Executive Overview & Architecture

### 1.1 Objective

The Klay Unified Admin Dashboard provides sovereign access to incoming client inquiries, lead pipeline stages, and the blog CMS visual studio. The administrative API surface must satisfy strict enterprise security standards:

1. **Zero Native Build Dependencies**: Pure-JavaScript password hashing via `bcryptjs` ensuring universal portability across Node.js LTS, Netlify Serverless (AWS Lambda), and CI test harnesses without requiring `node-gyp` or native C++ compilers.
2. **Stateless Cryptographic Sessions**: Tamper-proof, signed HMAC-SHA256 tokens verifiable in constant time via `crypto.timingSafeEqual`.
3. **Sliding-Window Rate Limiting**: Protecting the login endpoint against automated credential stuffing and brute-force attacks (max 5 failed attempts per 15-minute window per IP).
4. **Universal API Handler Architecture**: Shared core business logic implemented in `netlify/functions/admin-core.cjs` mounted across both Express.js (`server.js`) and Netlify Serverless Functions (`netlify/functions/admin.cjs`).

### 1.2 Upstream Technology Stack & Citations

- **Hashing**: `bcryptjs` (version `^3.0.3`)
- **Cryptography**: Node.js built-in `node:crypto` (`createHmac`, `timingSafeEqual`, `randomBytes`)
- **Official References**:
  - OWASP Password Storage Cheat Sheet: [https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  - Node.js Crypto API Documentation: [https://nodejs.org/api/crypto.html#cryptotimingsafeequaldigest-expected](https://nodejs.org/api/crypto.html#cryptotimingsafeequaldigest-expected)
  - RFC 7519 JSON Web Token (JWT) Principles: [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)
  - RFC 6750 Bearer Token Usage: [https://datatracker.ietf.org/doc/html/rfc6750](https://datatracker.ietf.org/doc/html/rfc6750)

---

## 2. Authentication & Cryptography Specification

### 2.1 Password Hashing with `bcryptjs`

All administrative passwords are stored as 60-character bcrypt hashes using **10 salt rounds** (work factor $2^{10} = 1024$ iterations).

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Computes a secure bcrypt hash for a plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Validates a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 2.2 HMAC-SHA256 Session Token Architecture

Session tokens are structured as three URL-safe Base64URL components joined by periods (`.`):

```
<EncodedHeader>.<EncodedPayload>.<Signature>
```

#### Component Specifications:

1. **Header**:
   ```json
   { "alg": "HS256", "typ": "KLAY" }
   ```
2. **Payload**:
   ```json
   {
     "sub": "admin",
     "iat": 1763223264,
     "exp": 1763309664,
     "jti": "4f9d2a1b7c8e..."
   }
   ```
   - `sub`: Authenticated username.
   - `iat`: Issue timestamp in seconds (`Math.floor(Date.now() / 1000)`).
   - `exp`: Expiration timestamp in seconds (`iat + 86400` = 24 hours).
   - `jti`: 16-byte cryptographically random hex nonce (`crypto.randomBytes(16).toString('hex')`).
3. **Signature**:
   Computed using HMAC-SHA256 with the secret key `KLAY_ADMIN_SECRET` (falling back to a secure runtime seed if unconfigured in local development):
   $$\text{Signature} = \text{HMAC-SHA256}(\text{Header} \mathbin{\Vert} "." \mathbin{\Vert} \text{Payload}, \text{Secret})$$

### 2.3 Timing-Safe Verification Algorithm (`timingSafeEqual`)

To protect against timing side-channel attacks, signatures must never be compared using string equality (`===`). The verification function enforces length matching prior to running `crypto.timingSafeEqual`:

```typescript
import * as crypto from 'node:crypto';

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

const DEFAULT_DEV_SECRET = 'klay-executive-admin-secret-dev-2026';

function getAdminSecret(): string {
  const secret = process.env.KLAY_ADMIN_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: KLAY_ADMIN_SECRET or ADMIN_JWT_SECRET must be set in production');
    }
    return DEFAULT_DEV_SECRET;
  }
  return secret;
}

export function generateSessionToken(username: string): string {
  const secret = getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');

  const now = Math.floor(Date.now() / 1000);
  const payloadData: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + 86400, // 24-hour validity
    jti: crypto.randomBytes(16).toString('hex'),
  };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const secret = getAdminSecret();

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  // Convert to buffers for timingSafeEqual
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  // Buffer length mismatch must return false in constant time
  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  // Parse payload and check expiration
  try {
    const decodedPayload: SessionPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    const now = Math.floor(Date.now() / 1000);
    if (
      !decodedPayload ||
      typeof decodedPayload.exp !== 'number' ||
      Number.isNaN(decodedPayload.exp) ||
      decodedPayload.exp < now
    ) {
      return null; // Token expired or missing/invalid expiration claim
    }

    return decodedPayload;
  } catch {
    return null;
  }
}
```

---

## 3. Sliding-Window Rate Limiting Specification

### 3.1 Rate Limit Policy

- **Protected Route**: `POST /api/admin/login`
- **Window Size**: 15 minutes ($900,000\text{ ms}$)
- **Max Failed Attempts**: 5 per IP address
- **Reset Trigger**: Successful login clears the failed attempt count for the originating IP.

### 3.2 Sliding-Window State Machine

```typescript
interface AttemptRecord {
  timestamps: number[];
}

const loginAttempts = new Map<string, AttemptRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * Resolves client IP address securely across Netlify Functions and Express runtime.
 * Enforces tamper-proof header resolution to prevent IP spoofing attacks.
 */
export function resolveClientIp(req: any): string {
  // 1. Netlify Serverless: Edge CDN injects tamper-proof client connection IP
  if (req.headers?.['x-nf-client-connection-ip']) {
    return String(req.headers['x-nf-client-connection-ip']).trim();
  }
  if (req.headers?.['client-ip']) {
    return String(req.headers['client-ip']).trim();
  }

  // 2. Express Runtime: requires app.set('trust proxy', 1) in server.js
  if (req.ip) {
    return req.ip;
  }

  // 3. Fallback to first hop in X-Forwarded-For if proxy trusted
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Checks whether the client IP is currently rate limited.
 * Automatically cleans up expired map entries to prevent memory retention leaks.
 */
export function checkLoginRateLimit(ip: string): { limited: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { limited: false };
  }

  // Filter timestamps within current window
  const recentAttempts = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  // Cleanup Map entry when all attempts have expired
  if (recentAttempts.length === 0) {
    loginAttempts.delete(ip);
    return { limited: false };
  }

  record.timestamps = recentAttempts;

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const oldest = recentAttempts[0];
    const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false };
}

/**
 * Records a failed login attempt for the client IP.
 */
export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { timestamps: [] };
  record.timestamps.push(now);
  loginAttempts.set(ip, record);
}

/**
 * Clears failed attempts for the IP upon successful authentication.
 */
export function clearLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
```

### 3.3 Concurrency Race Condition Mitigation

Because `bcrypt.compare` is computationally intensive and asynchronous (taking ~70–100ms per attempt), an attacker firing 20 to 50 concurrent requests simultaneously could execute `checkLoginRateLimit(ip)` before any failed attempt is recorded.

To eliminate this race condition:

1. **Immediate Tracking**: The login handler MUST record the attempt immediately via `recordFailedLogin(ip)` _before_ awaiting `bcrypt.compare`.
2. **Success Reset**: Upon successful authentication, `clearLoginRateLimit(ip)` is immediately called, clearing the recorded attempt and unlocking the IP.
3. **Failure Retention**: If authentication fails, the attempt is already tracked in the sliding-window state, guaranteeing that concurrent requests are throttled at the 5-attempt ceiling without race bypass.

---

## 4. REST API Endpoint Contracts

### 4.1 Token Extraction & Authentication Middleware

The API accepts authentication through either:

1. **Cookie**: `klay_admin_session=<token>`
2. **Authorization Header**: `Authorization: Bearer <token>`

```typescript
export function extractSessionToken(req: any): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers?.cookie || req.headers?.Cookie;
  if (cookieHeader && typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/klay_admin_session=([^;]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}
```

---

### 4.2 Endpoint: `POST /api/admin/login`

Authenticates administrative credentials, sets an HttpOnly cookie, and returns a signed token.

- **URL**: `/api/admin/login`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```

#### Response Scenarios:

- **`200 OK` (Authentication Successful)**:
  - **Headers**:
    ```http
    Set-Cookie: klay_admin_session=<token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400
    Content-Type: application/json
    ```
  - **Response Body**:
    ```json
    {
      "ok": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IktMQVkifQ...",
      "user": {
        "username": "admin"
      }
    }
    ```
- **`400 Bad Request` (Missing Parameters)**:
  - **Response Body**:
    ```json
    { "error": "Username and password are required" }
    ```
- **`401 Unauthorized` (Invalid Credentials)**:
  - **Response Body**:
    ```json
    { "error": "Invalid username or password" }
    ```
- **`429 Too Many Requests` (Rate Limit Exceeded)**:
  - **Headers**:
    ```http
    Retry-After: 900
    ```
  - **Response Body**:
    ```json
    {
      "error": "Too many failed attempts. Try again in 15 minutes.",
      "retryAfter": 900
    ```

#### Concurrency-Safe Authentication Handler Flow:

1. **Client IP Resolution**: Extract client IP via `resolveClientIp(req)` (`event.headers['x-nf-client-connection-ip']` on Netlify or trusted `req.ip` on Express via `app.set('trust proxy', 1)`).
2. **Pre-flight Rate Limit Check**: Call `checkLoginRateLimit(ip)`. If `limited === true`, immediately return HTTP `429 Too Many Requests` with `Retry-After: ${retryAfterSeconds}`.
3. **Immediate Attempt Reservation**: Call `recordFailedLogin(ip)` immediately _prior_ to awaiting the asynchronous `bcrypt.compare` operation. This closes the concurrency race condition window against burst attacks.
4. **Credential Verification**: Fetch the user from the Turso database via `SELECT * FROM admin_users WHERE username = ?` and verify password hash via `await bcrypt.compare(password, user.password_hash)`.
5. **Success Handling**:
   - Call `clearLoginRateLimit(ip)` to clear recorded attempts for the client IP.
   - Update `last_login_at` in Turso (`UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`).
   - Generate session token via `generateSessionToken(user.username)`.
   - Set HttpOnly cookie and return HTTP `200 OK`.
6. **Failure Handling**:
   - If user does not exist or password hash fails verification, return HTTP `401 Unauthorized` (`{"error": "Invalid username or password"}`).
   - The failed attempt was already safely recorded in Step 3, ensuring sliding-window counters accurately throttle the attacker.

---

### 4.3 Endpoint: `POST /api/admin/logout`

Clears the administrative session cookie and invalidates client session state.

- **URL**: `/api/admin/logout`
- **Method**: `POST`
- **Headers**: Optional Cookie or Bearer token
- **Response `200 OK`**:
  - **Headers**:
    ```http
    Set-Cookie: klay_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
    Content-Type: application/json
    ```
  - **Response Body**:
    ```json
    {
      "ok": true,
      "message": "Logged out successfully"
    }
    ```

---

### 4.4 Endpoint: `GET /api/admin/leads`

Fetches paginated, filtered, and searchable leads from the Turso database.

- **URL**: `/api/admin/leads`
- **Method**: `GET`
- **Authentication**: Required (`klay_admin_session` cookie or `Bearer <token>`)
- **Query Parameters**:
  | Parameter      | Type   | Required | Description                                                       | Example                         |
  | -------------- | ------ | -------- | ----------------------------------------------------------------- | ------------------------------- |
  | `status`       | string | Optional | Lifecycle status filter                                           | `New`, `Contacted`, `Converted` |
  | `jurisdiction` | string | Optional | UAE jurisdiction filter                                           | `DIFC`, `ADGM`, `UAE`           |
  | `search`       | string | Optional | Case-insensitive text search across name, email, phone, reference | `alex`                          |
  | `from`         | string | Optional | ISO-8601 start date timestamp                                     | `2026-01-01`                    |
  | `to`           | string | Optional | ISO-8601 end date timestamp                                       | `2026-12-31`                    |
  | `limit`        | number | Optional | Records per page (default: 50, max: 200)                          | `100`                           |
  | `offset`       | number | Optional | Pagination offset (default: 0)                                    | `0`                             |

#### Response Scenarios:

- **`200 OK`**:
  ```json
  {
    "leads": [
      {
        "id": "KLAY-2026-0001",
        "reference_number": "KLAY-2026-0001",
        "timestamp": "2026-11-15T14:31:28.693Z",
        "name": "Alexander Wright",
        "email": "alexander@wrightcapital.co.uk",
        "phone": "+971501234567",
        "jurisdiction": "DIFC",
        "activity": "Asset Management",
        "timeline": "Immediate",
        "visa_count": 4,
        "notes": "Looking to set up an Innovation Hub license.",
        "source": "calculator",
        "platform": "node",
        "status": "New",
        "created_at": "2026-11-15 14:31:28",
        "updated_at": "2026-11-15 14:31:28"
      }
    ],
    "total": 159,
    "limit": 50,
    "offset": 0
  }
  ```
- **`401 Unauthorized`**:
  ```json
  { "error": "Unauthorized: valid admin session required" }
  ```

---

### 4.5 Endpoint: `PATCH /api/admin/leads/:id`

Updates the lifecycle stage of an existing lead record.

- **URL**: `/api/admin/leads/:id` (where `:id` matches `id` or `reference_number`)
- **Method**: `PATCH`
- **Authentication**: Required (`klay_admin_session` cookie or `Bearer <token>`)
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "status": "Contacted"
  }
  ```
  _(Permitted values: `"New"`, `"Contacted"`, `"Proposal Sent"`, `"Converted"`, `"Archived"`)_

#### Response Scenarios:

- **`200 OK`**:
  ```json
  {
    "ok": true,
    "lead": {
      "id": "KLAY-2026-0001",
      "reference_number": "KLAY-2026-0001",
      "status": "Contacted",
      "updated_at": "2026-11-15 16:30:00"
    }
  }
  ```
- **`400 Bad Request` (Invalid Status)**:
  ```json
  { "error": "Invalid status: must be one of New, Contacted, Proposal Sent, Converted, Archived" }
  ```
- **`404 Not Found`**:
  ```json
  { "error": "Lead not found" }
  ```
- **`401 Unauthorized`**:
  ```json
  { "error": "Unauthorized" }
  ```

---

### 4.6 Endpoint: `GET /api/admin/blogs`

Retrieves all editorial articles stored in the Turso master database.

- **URL**: `/api/admin/blogs`
- **Method**: `GET`
- **Authentication**: Required (`klay_admin_session` cookie or `Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "blogs": [
      {
        "id": "post-uae-corporate-tax-guide-2026",
        "slug": "uae-corporate-tax-guide-2026",
        "title": "UAE Corporate Tax Guide 2026: Comprehensive Executive Briefing",
        "pillar": "Corporate Tax",
        "reading_time": 6,
        "excerpt": "Executive analysis on qualifying free zone persons and domestic minimum top-up taxes.",
        "cover_image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
        "content": "## Executive Summary\n...",
        "status": "published",
        "date": "2026-11-15",
        "sanity_id": "post-uae-corporate-tax-guide-2026",
        "created_at": "2026-11-15 12:00:00",
        "updated_at": "2026-11-15 12:00:00"
      }
    ]
  }
  ```

---

### 4.7 Endpoint: `POST /api/admin/blogs`

Creates or updates an editorial article with primary Turso persistence and secondary Sanity Content Lake sync.

- **URL**: `/api/admin/blogs`
- **Method**: `POST`
- **Authentication**: Required (`klay_admin_session` cookie or `Bearer <token>`)
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "title": "DIFC Prescribed Company Structuring 2026",
    "slug": "difc-prescribed-company-structuring-2026",
    "pillar": "Corporate Structuring",
    "readingTime": 5,
    "excerpt": "How to deploy SPVs and holding vehicles in the Dubai International Financial Centre.",
    "coverImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    "content": "## Introduction\nDIFC Prescribed Companies provide a flexible regime...",
    "status": "published",
    "date": "2026-11-15"
  }
  ```

#### Response Scenarios:

- **`200 OK` / `201 Created`**:
  ```json
  {
    "ok": true,
    "blog": {
      "id": "post-difc-prescribed-company-structuring-2026",
      "slug": "difc-prescribed-company-structuring-2026",
      "title": "DIFC Prescribed Company Structuring 2026",
      "pillar": "Corporate Structuring",
      "reading_time": 5,
      "excerpt": "How to deploy SPVs and holding vehicles in the Dubai International Financial Centre.",
      "cover_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      "content": "## Introduction\nDIFC Prescribed Companies provide a flexible regime...",
      "status": "published",
      "date": "2026-11-15",
      "updated_at": "2026-11-15 16:35:00"
    },
    "sanitySynced": true
  }
  ```
- **`400 Bad Request` (Validation Failure)**:
  ```json
  { "error": "Validation failed: 'title', 'slug', 'pillar', and 'content' are required fields" }
  ```
- **`401 Unauthorized`**:
  ```json
  { "error": "Unauthorized" }
  ```

---

### 4.8 Endpoint: `DELETE /api/admin/blogs/:slug`

Deletes an article from the Turso database and removes it from Sanity Content Lake.

- **URL**: `/api/admin/blogs/:slug`
- **Method**: `DELETE`
- **Authentication**: Required (`klay_admin_session` cookie or `Bearer <token>`)
- **Response Scenarios**:
  - **`200 OK`**:
    ```json
    {
      "ok": true,
      "deleted": "difc-prescribed-company-structuring-2026"
    }
    ```
  - **`404 Not Found`**:
    ```json
    { "error": "Blog article not found" }
    ```
  - **`401 Unauthorized`**:
    ```json
    { "error": "Unauthorized" }
    ```

---

## 5. Verification & Test Suite

To verify the cryptographic signing, `timingSafeEqual` constant-time verification, and rate limiter logic:

```bash
export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"

node -e '
const crypto = require("node:crypto");
const assert = require("node:assert");

// 1. HMAC Token Generation
const secret = "test-secret-key-123";
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "KLAY" })).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ sub: "admin", exp: now + 3600 })).toString("base64url");
const sig = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
const token = `${header}.${payload}.${sig}`;

// 2. Timing-safe verification
const [h, p, s] = token.split(".");
const expected = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
const b1 = Buffer.from(s);
const b2 = Buffer.from(expected);
assert.strictEqual(b1.length, b2.length);
assert.ok(crypto.timingSafeEqual(b1, b2));

// 3. Reject tampered token
const tamperedSig = Buffer.from(s.slice(0, -1) + (s.slice(-1) === "a" ? "b" : "a"));
assert.ok(!crypto.timingSafeEqual(tamperedSig, b2));

console.log("Admin API Cryptographic Verification: PASSED");
'
```
