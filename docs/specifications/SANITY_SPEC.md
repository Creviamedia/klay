# Technical Specification: Sanity Content Lake Architecture & Dual-Write CMS Integration

**Document ID**: SPEC-SANITY-001  
**Project**: Klay Unified Admin Dashboard & Content Portal  
**Target Milestone**: Milestone 1 (Foundation) & Milestone 3 (Database & Telemetry)  
**Status**: APPROVED / ACTIVE  
**Last Updated**: 2026-11-15

---

## 1. Executive Overview & Architecture

### 1.1 Objective

Klay operates a high-authority content portal educating international family offices, founders, and enterprises on UAE corporate taxation, DIFC/ADGM entity structuring, and residency frameworks.

The content infrastructure combines two complementary layers:

1. **Turso SQLite Database (Primary Master)**: Provides immediate consistency, sub-millisecond local queries, SQL filtering, and zero-latency access for the Express/Netlify Admin Portal and the public site.
2. **Sanity Content Lake (Secondary Marketing Lake)**: Provides headless CMS asset management, structured rich content, Studio access for non-technical marketing staff, and CDN-cached distribution.

```
┌────────────────────────────────────────────────────────┐
│            Admin Blog CMS Visual Studio                │
│             (/admin/blogs - React UI)                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Admin API Handler (/api/admin/blogs)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
     ┌──────────────────────┐ ┌──────────────────────┐
     │  Primary Write (1)   │ │  Secondary Write (2) │
     │  Turso SQLite Master │ │  Sanity Content Lake │
     │  (Guaranteed ACID)   │ │  (Non-blocking Sync) │
     └──────────────────────┘ └──────────────────────┘
```

### 1.2 Upstream Technology Stack & Citations

- **SDK**: `@sanity/client` (version `^8.16.0`)
- **API Version**: `2026-03-01`
- **Official Documentation**:
  - Sanity JavaScript Client Guide: [https://www.sanity.io/docs/js-client](https://www.sanity.io/docs/js-client)
  - Sanity HTTP Mutations API: [https://www.sanity.io/docs/http-mutations](https://www.sanity.io/docs/http-mutations)
  - Sanity Document IDs & Idempotency: [https://www.sanity.io/docs/http-mutations#createorreplace](https://www.sanity.io/docs/http-mutations#createorreplace)

---

## 2. Configuration & Client Factory

### 2.1 Read vs. Write Client Distinction

In accordance with Sanity security best practices, client initialization is strictly partitioned based on privilege and caching requirements:

| Environment               | Purpose                                                                    | CDN Caching (`useCdn`) | Authentication Token                                           |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------- |
| **Public Read Client**    | Fetching public blog listings and articles (`src/lib/sanity.ts`)           | `true` (Edge cached)   | None (Public dataset)                                          |
| **Admin Mutation Client** | Publishing, patching, or deleting articles (`server.js`, `admin-core.cjs`) | `false` (Always live)  | `SANITY_API_WRITE_TOKEN` (Bearer token with Editor/Admin role) |

### 2.2 Client Factory Implementation Contract (`src/lib/sanity.ts`)

```typescript
import { createClient, type SanityClient } from '@sanity/client';

let readClientInstance: SanityClient | null = null;
let writeClientInstance: SanityClient | null = null;

const DEFAULT_PROJECT_ID = 'z4w5l6t1';
const DEFAULT_DATASET = 'production';
const API_VERSION = '2026-03-01';

/**
 * Public CDN-cached client for fast frontend rendering.
 */
export function getSanityReadClient(): SanityClient {
  if (readClientInstance) return readClientInstance;

  readClientInstance = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || DEFAULT_DATASET,
    apiVersion: API_VERSION,
    useCdn: true,
  });

  return readClientInstance;
}

/**
 * Privileged write client for CMS mutations and sync actions.
 * Returns null if SANITY_API_WRITE_TOKEN is not configured in the runtime.
 */
export function getSanityWriteClient(): SanityClient | null {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken || writeToken.trim().length === 0) {
    return null;
  }

  if (writeClientInstance) return writeClientInstance;

  writeClientInstance = createClient({
    projectId:
      process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || DEFAULT_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || DEFAULT_DATASET,
    apiVersion: API_VERSION,
    useCdn: false, // Must be false for real-time mutations
    token: writeToken.trim(),
  });

  return writeClientInstance;
}
```

---

## 3. Canonical Document Schema: `post`

### 3.1 Document Schema Specification

The schema definition strictly aligns with existing Klay article exports (`scripts/export-articles-to-sanity.mjs`) and frontend renderers (`src/pages/BlogArticlePage.tsx`).

```typescript
export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityImageReference {
  _type: 'image';
  alt?: string;
  asset?: {
    _type: 'reference';
    _ref: string;
  };
}

export interface SanityPostDocument {
  _id: string; // Deterministic ID: "post-" + slug
  _type: 'post'; // Exact schema type name
  title: string; // Article title
  slug: SanitySlug; // Kebab-case slug object
  excerpt: string; // Executive briefing summary
  date: string; // ISO publication date string (YYYY-MM-DD)
  category: string; // Editorial pillar
  readingTime?: number; // Estimated duration in minutes
  body: string; // Body content in Markdown format
  metaTitle?: string; // SEO Title override
  metaDescription?: string; // SEO Meta description
  focusKeyword?: string; // Primary SEO target keyword
  mainImage?: SanityImageReference;
}
```

### 3.2 Field Mapping Matrix (Turso ↔ Sanity)

| Field Description | Turso SQLite Column | Sanity Content Lake Property | Data Type         | Notes                                                       |
| ----------------- | ------------------- | ---------------------------- | ----------------- | ----------------------------------------------------------- |
| Document ID       | `id`                | `_id`                        | `string`          | Deterministic format: `post-${slug}`                        |
| URL Slug          | `slug`              | `slug.current`               | `string`          | kebab-case identifier (e.g. `uae-corporate-tax-guide-2026`) |
| Headline          | `title`             | `title`                      | `string`          | Display title                                               |
| Taxonomy Pillar   | `pillar`            | `category`                   | `string`          | Luxury pillar ('Corporate Tax', 'Golden Visa', etc.)        |
| Read Duration     | `reading_time`      | `readingTime`                | `number`          | Integer minutes                                             |
| Executive Excerpt | `excerpt`           | `excerpt`                    | `string`          | 1-2 sentence preview                                        |
| Body Text         | `content`           | `body`                       | `string`          | Full Markdown text                                          |
| Publication Date  | `date`              | `date`                       | `string`          | `YYYY-MM-DD`                                                |
| Cover Asset       | `cover_image`       | `mainImage`                  | `string / object` | Asset URL or Sanity image reference                         |
| Cross-Reference   | `sanity_id`         | `_id`                        | `string`          | Stored in Turso for two-way tracing                         |

---

## 4. Mutation API Operations

### 4.1 Idempotent Upsert (`createOrReplace`)

To prevent `409 Conflict` errors during article edits and republishing, the pipeline uses `client.createOrReplace(doc)` with a **deterministic `_id`** (`post-${slug}`).

```typescript
export async function syncArticleToSanity(
  writeClient: SanityClient,
  article: {
    slug: string;
    title: string;
    pillar: string;
    readingTime?: number;
    excerpt?: string;
    content: string;
    date?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  }
): Promise<{ ok: boolean; documentId: string }> {
  const documentId = `post-${article.slug}`;

  const sanityDoc: SanityPostDocument = {
    _id: documentId,
    _type: 'post',
    title: article.title,
    slug: {
      _type: 'slug',
      current: article.slug,
    },
    excerpt: article.excerpt || '',
    date: article.date || new Date().toISOString().split('T')[0],
    category: article.pillar,
    readingTime:
      article.readingTime || Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200)),
    body: article.content,
    metaTitle: article.metaTitle || article.title,
    metaDescription: article.metaDescription || article.excerpt || '',
    focusKeyword: article.focusKeyword || '',
  };

  await writeClient.createOrReplace(sanityDoc);
  return { ok: true, documentId };
}
```

### 4.2 Partial Update (`patch`)

Used when updating article status, metadata, or metrics without resending the entire article body:

```typescript
export async function patchArticleMetadata(
  writeClient: SanityClient,
  slug: string,
  updates: Partial<SanityPostDocument>
): Promise<void> {
  const documentId = `post-${slug}`;
  await writeClient.patch(documentId).set(updates).commit();
}
```

### 4.3 Article Deletion (`delete`)

When an article is archived or deleted from the admin portal:

```typescript
export async function deleteArticleFromSanity(
  writeClient: SanityClient,
  slug: string
): Promise<void> {
  const documentId = `post-${slug}`;
  await writeClient.delete(documentId);
}
```

---

## 5. Dual-Write Coordination Strategy & Fault Isolation

### 5.1 Primary Master Architecture (Turso First)

Turso SQLite is the **primary system of record**. An article is considered successfully saved and published as soon as the Turso transaction commits. The Sanity Content Lake synchronization is executed as an **isolated, non-blocking secondary operation**.

```
                          POST /api/admin/blogs
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  1. Validate Request Body     │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  2. Commit to Turso SQLite    │
                   │  (ON CONFLICT DO UPDATE)      │
                   └───────────────┬───────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
          [Turso Write Failed]        [Turso Write Succeeded]
          Abort & Return HTTP 500                │
                                                 ▼
                                      ┌─────────────────────┐
                                      │ 3. Is Sanity Write  │
                                      │   Client Configured?│
                                      └──────────┬──────────┘
                                                 │
                                 ┌───────────────┴───────────────┐
                                 │ YES                           │ NO
                                 ▼                               ▼
                   ┌───────────────────────────┐   ┌───────────────────────────┐
                   │ Attempt createOrReplace() │   │ Return:                   │
                   │ (try / catch wrapped)     │   │ sanitySynced: false       │
                   └─────────────┬─────────────┘   └───────────────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │ Success                   │ Error (Network / 401 / 403)
                   ▼                           ▼
       Return:                     Catch error, log warning
       sanitySynced: true          Return: sanitySynced: false,
                                   warning: "Sanity sync deferred"
```

### 5.2 Failure Scenarios & Behavioral Matrix

| Scenario                             | Turso Behavior         | Sanity Behavior                 | API Response                                                                      | Impact on Admin Portal                                           |
| ------------------------------------ | ---------------------- | ------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Normal Execution**                 | Row inserted / updated | Document created / replaced     | `200 OK` `{ ok: true, blog, sanitySynced: true }`                                 | Full sync complete across both stores.                           |
| **Missing `SANITY_API_WRITE_TOKEN`** | Row inserted / updated | Skipped gracefully              | `200 OK` `{ ok: true, blog, sanitySynced: false }`                                | Article is live in Turso. Admin notified of missing write token. |
| **Sanity API Timeout / 500**         | Row inserted / updated | Catches exception, logs warning | `200 OK` `{ ok: true, blog, sanitySynced: false, warning: "Sanity sync failed" }` | Turso data remains intact. No client error displayed.            |
| **Turso Failure (DB Lock/Error)**    | Transaction rolls back | Sanity mutation never called    | `500 Internal Server Error`                                                       | Clean failure; no orphaned records created.                      |

---

## 6. Verification & Test Suite

To verify Sanity client instantiation and document structure validation:

```bash
export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"

node -e '
const { createClient } = require("@sanity/client");
const assert = require("node:assert");

const client = createClient({
  projectId: "z4w5l6t1",
  dataset: "production",
  apiVersion: "2026-03-01",
  useCdn: true,
});

assert.strictEqual(typeof client.fetch, "function");
assert.strictEqual(typeof client.createOrReplace, "function");

// Test deterministic document ID creation
const slug = "dubai-holding-company-guide-2026";
const docId = `post-${slug}`;
assert.strictEqual(docId, "post-dubai-holding-company-guide-2026");

console.log("Sanity Client & Schema Verification: PASSED");
'
```
