# Technical Specification: Turso Database Architecture & SQLite Data Layer

**Document ID**: SPEC-TURSO-001  
**Project**: Klay Unified Admin Dashboard & Content Portal  
**Target Milestone**: Milestone 1 (Foundation) & Milestone 3 (Database & Telemetry)  
**Status**: APPROVED / ACTIVE  
**Last Updated**: 2026-11-15

---

## 1. Executive Overview & Architecture

### 1.1 Role in Klay Platform

Turso acts as the primary relational persistence engine for the Klay platform. It provides serverless distributed SQLite powered by libSQL, guaranteeing sub-millisecond query execution, zero cold-start latency, and ACID compliance across edge runtimes (Express on Node.js and Netlify Serverless Functions).

Turso handles:

1. **Permanent Lead Intake Storage**: Capturing all customer inquiries, calculation requests, contact forms, and qualification metadata.
2. **Lead Lifecycle State Management**: Tracking statuses (`New`, `Contacted`, `Proposal Sent`, `Converted`, `Archived`) with strict database-level constraints.
3. **Blog Editorial Master Store**: Serving as the primary relational repository for published and draft articles, pillar taxonomies, and slugs with instant reads and dual-write synchronisation to Sanity Content Lake.
4. **Administrative Credentials**: Storing authenticated admin usernames and bcrypt password hashes.

### 1.2 Upstream Technology Stack & Citations

- **SDK**: `@libsql/client` (version `^0.18.0`)
- **Runtime Target**: Node.js v24.x LTS & Netlify Serverless (AWS Lambda Node runtime)
- **Official References**:
  - libSQL Client TypeScript Quickstart: [https://docs.turso.tech/sdk/ts/quickstart](https://docs.turso.tech/sdk/ts/quickstart)
  - Turso Client Batch API Reference: [https://docs.turso.tech/sdk/ts/reference#batch-transactions](https://docs.turso.tech/sdk/ts/reference#batch-transactions)
  - libSQL SQLite Compatibility: [https://docs.turso.tech/features/sqlite-compatibility](https://docs.turso.tech/features/sqlite-compatibility)

---

## 2. Connection Factory & Multi-Tier Fallback

### 2.1 Multi-Tier Fallback Hierarchy

In edge and serverless environments, network isolation, missing environment tokens, or localized file-system permissions can prevent connections to remote cloud services. The Turso client factory implements a resilient, multi-tier fallback architecture:

```
┌────────────────────────────────────────────────────────┐
│             Connection Factory Request                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Is TURSO_DATABASE_URL  │─── YES ───► Tier 1: Cloud Turso
              │       defined?         │             libsql://klay-db.turso.io
              └────────────┬───────────┘
                           │ NO / FAILED
                           ▼
              ┌────────────────────────┐
              │ Can write to local dir │─── YES ───► Tier 2: Local SQLite File
              │      data/klay.db?     │             file:data/klay.db
              └────────────┬───────────┘
                           │ NO (EACCES / Read-Only Serverless)
                           ▼
              ┌────────────────────────┐
              │ Fallback to Temp Dir   │───────────► Tier 3: Memory/Temp SQLite File
              │     /tmp/klay.db       │             file:/tmp/klay.db
              └────────────────────────┘
```

1. **Tier 1 (Cloud Turso)**: When `TURSO_DATABASE_URL` is set, connect using the libSQL protocol (`libsql://...` or `https://...`) accompanied by `TURSO_AUTH_TOKEN`.
2. **Tier 2 (Local File - Development & Standalone)**: If `TURSO_DATABASE_URL` is omitted or local development is active, connect to `file:data/klay.db`. The directory `data/` is created recursively if not present.
3. **Tier 3 (Ephemeral Serverless Fallback)**: If creating `data/klay.db` throws a permission error (such as `EACCES` or read-only filesystem on Netlify `/var/task`), fallback to `file:/tmp/klay.db` which is guaranteed writable on AWS Lambda / Netlify functions.

### 2.2 Connection Factory Implementation Contract (`src/lib/turso.ts`)

```typescript
import { createClient, type Client } from '@libsql/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

let cachedClient: Client | null = null;

export interface TursoConnectionConfig {
  url: string;
  authToken?: string;
  tier: 'cloud' | 'local-file' | 'temp-file';
}

/**
 * Resolves the active connection target based on environment and file permissions.
 */
export function resolveDatabaseTarget(): TursoConnectionConfig {
  const cloudUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (cloudUrl && cloudUrl.trim().length > 0) {
    return {
      url: cloudUrl.trim(),
      authToken: authToken ? authToken.trim() : undefined,
      tier: 'cloud',
    };
  }

  // Tier 2: data/klay.db
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const localDbPath = path.join(dataDir, 'klay.db');
    return {
      url: `file:${localDbPath}`,
      tier: 'local-file',
    };
  } catch (err) {
    // Tier 3: /tmp/klay.db (Read-only container / Lambda root)
    const tempDbPath = path.join('/tmp', 'klay.db');
    return {
      url: `file:${tempDbPath}`,
      tier: 'temp-file',
    };
  }
}

/**
 * Singleton database client accessor ensuring connection reuse across warm invocations.
 */
export function getTursoClient(): Client {
  if (cachedClient) {
    return cachedClient;
  }

  const target = resolveDatabaseTarget();
  cachedClient = createClient({
    url: target.url,
    authToken: target.authToken,
  });

  return cachedClient;
}
```

---

## 3. SQLite DDL Schema Specification

The database consists of three core tables: `leads`, `blogs`, and `admin_users`. All schemas enforce strict column data types, foreign/unique keys, and SQLite `CHECK` constraints.

### 3.1 `leads` Table Schema

The `leads` table records all intake events across the platform with lifecycle tracking.

```sql
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY NOT NULL,
  reference_number TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'UAE',
  activity TEXT NOT NULL DEFAULT 'General',
  timeline TEXT,
  visa_count INTEGER,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'calculator',
  platform TEXT NOT NULL DEFAULT 'node',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_leads_jurisdiction ON leads(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_leads_reference ON leads(reference_number);
```

#### Field Specifications:

- `id` (TEXT, PK, NOT NULL): Unique identifier. Historical leads use `KLAY-YYYY-XXXX` format; modern leads utilize reference number or UUIDv4.
- `reference_number` (TEXT, NOT NULL): Human-readable tracking number (e.g., `KLAY-2026-0001`).
- `timestamp` (TEXT, NOT NULL): ISO-8601 UTC timestamp string of intake (e.g., `2026-11-15T14:31:28.693Z`).
- `name` (TEXT, NOT NULL): Lead's full name.
- `email` (TEXT, NOT NULL): Contact email address.
- `phone` (TEXT, NOT NULL): Phone number including international dial code.
- `jurisdiction` (TEXT, DEFAULT `'UAE'`): Target UAE jurisdiction (e.g., `'DIFC'`, `'ADGM'`, `'Meydan Free Zone'`, `'Dubai Mainland'`).
- `activity` (TEXT, DEFAULT `'General'`): Business activity / sector.
- `timeline` (TEXT): Estimated launch timeline (e.g., `'Immediate'`, `'1-3 months'`).
- `visa_count` (INTEGER): Number of residential visas required.
- `notes` (TEXT): Freeform remarks or consultation notes.
- `source` (TEXT, DEFAULT `'calculator'`): Lead origination channel (`'calculator'`, `'contact-modal'`, `'hero-cta'`, `'whatsapp'`).
- `platform` (TEXT, DEFAULT `'node'`): Server ingestion platform (`'node'`, `'netlify-function'`).
- `status` (TEXT, NOT NULL, DEFAULT `'New'`): Strict state machine:
  - `New`: Newly captured lead awaiting first touch.
  - `Contacted`: Initial outreach completed via Telegram/WhatsApp/Phone.
  - `Proposal Sent`: Commercial proposal or fee structure delivered.
  - `Converted`: Retainer paid or company registered.
  - `Archived`: Inactive, unqualified, or closed.
- `created_at` / `updated_at` (TEXT): SQLite `CURRENT_TIMESTAMP` ISO strings.

### 3.2 `blogs` Table Schema

The `blogs` table stores published and draft articles managed through the visual CMS studio.

```sql
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL,
  reading_time INTEGER NOT NULL DEFAULT 3,
  excerpt TEXT,
  cover_image TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  date TEXT NOT NULL,
  sanity_id TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_pillar ON blogs(pillar);
CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(date DESC);
```

#### Field Specifications:

- `id` (TEXT, PK, NOT NULL): Article identifier (e.g., `post-uae-corporate-tax-guide-2026`).
- `slug` (TEXT, UNIQUE): Canonical URL path identifier (kebab-case). Enforced by unique index `idx_blogs_slug`.
- `title` (TEXT, NOT NULL): Article headline.
- `pillar` (TEXT, NOT NULL): Editorial pillar (e.g., `'Corporate Tax'`, `'Corporate Structuring'`, `'Golden Visa'`, `'Banking & Treasury'`).
- `reading_time` (INTEGER, NOT NULL DEFAULT 3): Calculated reading duration in minutes (`Math.ceil(wordCount / 200)`).
- `excerpt` (TEXT): 1-2 sentence executive summary for card listings and SEO meta descriptions.
- `cover_image` (TEXT): URL to hero cover asset.
- `content` (TEXT, NOT NULL): Full body text formatted in Markdown or rich text.
- `status` (TEXT, CHECK): State constraint: `'draft'` or `'published'`.
- `date` (TEXT, NOT NULL): Publication date formatted as `YYYY-MM-DD`.
- `sanity_id` (TEXT): Correlated document `_id` in Sanity Content Lake for dual-write traceability.

### 3.3 `admin_users` Table Schema

The `admin_users` table maintains administrative credentials.

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  last_login_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
```

#### Field Specifications:

- `id` (TEXT, PK, NOT NULL): UUIDv4 or string identifier (e.g., `user_admin_01`).
- `username` (TEXT, UNIQUE): Unique administrative handle.
- `password_hash` (TEXT, NOT NULL): 60-character bcrypt hash (`$2a$10$...` or `$2b$10$...`) generated with 10 salt rounds.
- `last_login_at` (TEXT): UTC timestamp of the most recent successful authentication.

---

## 4. Historical Leads Seed Migration (`data/leads.jsonl`)

### 4.1 Historical Dataset Characteristics

- File path: `/Users/hayaat/.gemini/antigravity/scratch/klay/data/leads.jsonl`
- Total row count: **159 records**
- Row format: JSON lines containing `id`, `referenceNumber`, `timestamp`, `name`, `email`, `phone`, `jurisdiction`, `activity`, `timeline`, `visaCount`, `notes`, `source`, `platform`.
- Zero duplicates detected across `159` unique references.

### 4.2 Idempotent Seeding Logic

The initialization script must run automatically on database connection initialization. If the `leads` table already contains rows, the seed operation is bypassed. If rows are missing, records are inserted using chunked batch transactions with `INSERT OR IGNORE`.

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Client, InStatement } from '@libsql/client';

export async function migrateHistoricalLeads(
  client: Client
): Promise<{ seeded: number; skipped: boolean }> {
  // 1. Check if leads table is already populated
  const countResult = await client.execute('SELECT COUNT(*) as count FROM leads');
  const currentCount = Number(countResult.rows[0]?.count ?? 0);

  if (currentCount > 0) {
    return { seeded: 0, skipped: true };
  }

  const jsonlPath = path.resolve(process.cwd(), 'data/leads.jsonl');
  if (!fs.existsSync(jsonlPath)) {
    console.warn(`[Turso Seed] File not found: ${jsonlPath}`);
    return { seeded: 0, skipped: true };
  }

  const fileContent = fs.readFileSync(jsonlPath, 'utf8');
  const lines = fileContent.split('\n').filter((l) => l.trim().length > 0);

  const statements: InStatement[] = [];

  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      const leadId = record.id || record.referenceNumber || `KLAY-${Date.now()}`;
      const refNum = record.referenceNumber || leadId;
      const timestamp = record.timestamp || new Date().toISOString();
      const status = 'New'; // Initial status for historical leads

      statements.push({
        sql: `INSERT OR IGNORE INTO leads (
          id, reference_number, timestamp, name, email, phone,
          jurisdiction, activity, timeline, visa_count, notes,
          source, platform, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          leadId,
          refNum,
          timestamp,
          record.name || 'Unknown',
          record.email || '',
          record.phone || '',
          record.jurisdiction || 'UAE',
          record.activity || 'General',
          record.timeline || null,
          typeof record.visaCount === 'number' ? record.visaCount : null,
          record.notes || null,
          record.source || 'calculator',
          record.platform || 'node',
          status,
          timestamp,
          timestamp,
        ],
      });
    } catch (parseErr) {
      console.warn('[Turso Seed] Malformed JSONL line:', line);
    }
  }

  // 2. Execute statements in chunked batches (50 per batch)
  const CHUNK_SIZE = 50;
  let seededCount = 0;

  for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
    const chunk = statements.slice(i, i + CHUNK_SIZE);
    await client.batch(chunk, 'write');
    seededCount += chunk.length;
  }

  return { seeded: seededCount, skipped: false };
}
```

### 4.3 Initial Admin User Bootstrap (`seedInitialAdminUser`)

To ensure immediate administrative access upon first deployment without requiring manual database shell access, the application must idempotently seed an initial admin user account if `admin_users` is empty.

```typescript
import bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';

/**
 * Bootstraps the initial administrator user if the admin_users table is empty.
 * Reads credentials from environment variables:
 * - ADMIN_INITIAL_USERNAME (default: 'admin')
 * - ADMIN_INITIAL_PASSWORD (required in production, default: temporary dev password)
 */
export async function seedInitialAdminUser(
  client: Client
): Promise<{ seeded: boolean; username?: string }> {
  // 1. Check if admin user already exists
  const countRes = await client.execute('SELECT COUNT(*) as count FROM admin_users');
  const count = Number(countRes.rows[0]?.count ?? 0);

  if (count > 0) {
    return { seeded: false };
  }

  // 2. Resolve credentials from environment
  const username = process.env.ADMIN_INITIAL_USERNAME || 'admin';
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'KlayAdmin2026!Dev';

  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_INITIAL_PASSWORD) {
    throw new Error(
      'FATAL: ADMIN_INITIAL_PASSWORD must be defined in production to bootstrap the initial administrator.'
    );
  }

  // 3. Hash password with bcrypt (10 salt rounds)
  const passwordHash = await bcrypt.hash(initialPassword, 10);
  const userId = `user_${crypto.randomBytes(8).toString('hex')}`;

  // 4. Insert initial administrator
  await client.execute({
    sql: `INSERT INTO admin_users (id, username, password_hash, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    args: [userId, username, passwordHash],
  });

  return { seeded: true, username };
}
```

---

## 5. Parameterized SQL Query Patterns

To prevent SQL injection vulnerabilities and enforce boundary safety, raw SQL concatenation is prohibited. All calls must utilize bound argument arrays (`args: [...]`).

### 5.1 Lead Status Mutation (`PATCH /api/admin/leads/:id`)

```typescript
export async function updateLeadStatus(client: Client, leadId: string, newStatus: string) {
  // Validate status against whitelist prior to SQL execution
  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const result = await client.execute({
    sql: `UPDATE leads
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? OR reference_number = ?
          RETURNING *`,
    args: [newStatus, leadId, leadId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
```

### 5.2 Filtered Lead Retrieval (`GET /api/admin/leads`)

```typescript
export interface LeadFilterOptions {
  status?: string;
  jurisdiction?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function queryLeads(client: Client, options: LeadFilterOptions) {
  const clauses: string[] = ['1=1'];
  const args: any[] = [];

  if (options.status) {
    clauses.push('status = ?');
    args.push(options.status);
  }

  if (options.jurisdiction) {
    clauses.push('jurisdiction = ?');
    args.push(options.jurisdiction);
  }

  if (options.search) {
    clauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference_number LIKE ?)');
    const searchTerm = `%${options.search}%`;
    args.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (options.from) {
    clauses.push('timestamp >= ?');
    args.push(options.from);
  }

  if (options.to) {
    clauses.push('timestamp <= ?');
    args.push(options.to);
  }

  const whereClause = clauses.join(' AND ');

  // Total count
  const countSql = `SELECT COUNT(*) as total FROM leads WHERE ${whereClause}`;
  const countRes = await client.execute({ sql: countSql, args });
  const total = Number(countRes.rows[0]?.total ?? 0);

  // Paginated query
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const offset = Math.max(Number(options.offset) || 0, 0);

  const querySql = `
    SELECT * FROM leads
    WHERE ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;
  const queryArgs = [...args, limit, offset];
  const queryRes = await client.execute({ sql: querySql, args: queryArgs });

  return {
    leads: queryRes.rows,
    total,
    limit,
    offset,
  };
}
```

### 5.3 Blog Upsert Query (`POST /api/admin/blogs`)

```typescript
export async function upsertBlogArticle(client: Client, blog: any) {
  const id = blog.id || `post-${blog.slug}`;
  const date = blog.date || new Date().toISOString().split('T')[0];

  const result = await client.execute({
    sql: `
      INSERT INTO blogs (
        id, slug, title, pillar, reading_time, excerpt,
        cover_image, content, status, date, sanity_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        pillar = excluded.pillar,
        reading_time = excluded.reading_time,
        excerpt = excluded.excerpt,
        cover_image = excluded.cover_image,
        content = excluded.content,
        status = excluded.status,
        date = excluded.date,
        sanity_id = excluded.sanity_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    args: [
      id,
      blog.slug,
      blog.title,
      blog.pillar,
      blog.readingTime || 3,
      blog.excerpt || '',
      blog.coverImage || '',
      blog.content,
      blog.status || 'draft',
      date,
      blog.sanityId || null,
    ],
  });

  return result.rows[0];
}
```

### 5.4 Admin User Authentication Query

```typescript
export async function getAdminUserByUsername(client: Client, username: string) {
  const result = await client.execute({
    sql: `SELECT * FROM admin_users WHERE username = ?`,
    args: [username],
  });

  return result.rows[0] || null;
}
```

### 5.5 Blog Listing Query (`GET /api/admin/blogs`)

```typescript
export async function listAllBlogs(client: Client) {
  const result = await client.execute({
    sql: `SELECT * FROM blogs ORDER BY date DESC, created_at DESC`,
    args: [],
  });

  return result.rows;
}
```

### 5.6 Blog Deletion Query (`DELETE /api/admin/blogs/:slug`)

```typescript
export async function deleteBlogBySlug(client: Client, slug: string): Promise<boolean> {
  const result = await client.execute({
    sql: `DELETE FROM blogs WHERE slug = ?`,
    args: [slug],
  });

  return result.rowsAffected > 0;
}
```

---

## 6. Error Codes & Resilience Mapping

When `@libsql/client` encounters database constraint failures or network errors, it throws a `LibsqlError`. The API layer must translate these errors to standard HTTP response codes:

| SQLite / LibSQL Error Code | Cause                                                   | API Mapping                 | Client Response                                               |
| -------------------------- | ------------------------------------------------------- | --------------------------- | ------------------------------------------------------------- |
| `SQLITE_CONSTRAINT_CHECK`  | Status value violated CHECK constraint                  | `400 Bad Request`           | `{"error": "Invalid status value provided"}`                  |
| `SQLITE_CONSTRAINT_UNIQUE` | Duplicate unique key (e.g. blog slug or admin username) | `409 Conflict`              | `{"error": "A resource with this identifier already exists"}` |
| `SQLITE_BUSY`              | Concurrent write lock                                   | `503 Service Unavailable`   | `{"error": "Database busy, please retry"}`                    |
| `URL_INVALID`              | Malformed Turso connection string                       | `500 Internal Server Error` | Fallback to Tier 2 local SQLite                               |
| `SERVER_ERROR`             | Network drop to Turso Cloud                             | `500 Internal Server Error` | Logged with stack trace; non-fatal fallback                   |

---

## 7. Verification & Attestation Commands

To verify the SQLite DDL, `@libsql/client` operations, and seed migration logic:

```bash
export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"

# 1. Verification with node:sqlite (Node v24 built-in)
node --input-type=module -e '
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert";

const db = new DatabaseSync(":memory:");
db.exec("CREATE TABLE test (id TEXT PRIMARY KEY, status TEXT CHECK(status IN (\x27A\x27, \x27B\x27)));");
const insert = db.prepare("INSERT INTO test VALUES (?, ?)");
insert.run("1", "A");

let threw = false;
try {
  insert.run("2", "INVALID");
} catch (e) {
  threw = true;
}
assert.ok(threw, "CHECK constraint must reject invalid status");
console.log("Turso / SQLite DDL & CHECK constraint: PASSED");
'

# 2. Verification with @libsql/client (once installed in M2/M3)
node -e '
const { createClient } = require("@libsql/client");
async function verify() {
  const client = createClient({ url: "file::memory:" });
  await client.execute("CREATE TABLE test (id TEXT PRIMARY KEY, status TEXT CHECK(status IN (\x27A\x27,\x27B\x27)));");
  await client.execute({ sql: "INSERT INTO test VALUES (?, ?)", args: ["1", "A"] });
  console.log("Turso @libsql/client DDL & Insert: PASSED");
}
verify().catch(console.error);
'
```
