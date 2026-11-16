/**
 * Turso Database Architecture & SQLite Data Layer (`src/lib/turso.ts`)
 *
 * Implements:
 * - Multi-tier connection factory (Cloud Turso -> Local SQLite data/klay.db -> Temp /tmp/klay.db)
 * - Strict SQLite DDL schema creation with CHECK constraints & indexes (leads, blogs, admin_users)
 * - Idempotent historical seed migration (159 leads from data/leads.jsonl with UAE phone normalization)
 * - Initial administrator user bootstrap with bcrypt hashing
 * - Parameterized query operations for leads, blogs, and admin authentication
 */

import { createClient, type Client, type InStatement } from '@libsql/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

let cachedClient: Client | null = null;

export interface TursoConnectionConfig {
  url: string;
  authToken?: string;
  tier: 'cloud' | 'local-file' | 'temp-file';
}

export interface LeadRecord {
  id: string;
  reference_number: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  budget?: string | null;
  jurisdiction: string;
  activity: string;
  timeline?: string | null;
  visa_count?: number | null;
  notes?: string | null;
  source: string;
  platform: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Converted' | 'Archived';
  created_at?: string;
  updated_at?: string;
}

export interface BlogRecord {
  id: string;
  slug: string;
  title: string;
  pillar: string;
  reading_time: number;
  readingTime?: number;
  excerpt?: string;
  cover_image?: string;
  coverImage?: string;
  content: string;
  status: 'draft' | 'published';
  date: string;
  sanity_id?: string | null;
  sanityId?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface LeadFilterOptions {
  status?: string;
  jurisdiction?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Normalizes UAE phone numbers for WhatsApp compatibility:
 * E.g., local 05xxxxxxxx -> 9715xxxxxxxx
 */
export function normalizePhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.startsWith('05') && (digitsOnly.length === 10 || digitsOnly.length === 9)) {
    return '971' + digitsOnly.slice(1);
  }
  if (trimmed.startsWith('05')) {
    return '971' + trimmed.slice(1);
  }
  if (digitsOnly.startsWith('97105')) {
    return '971' + digitsOnly.slice(4);
  }
  return trimmed;
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
  } catch {
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
export function getTursoClient(options?: { resetCache?: boolean }): Client {
  if (options?.resetCache) {
    if (cachedClient) {
      try {
        cachedClient.close();
      } catch {
        // Non-fatal
      }
      cachedClient = null;
    }
  }

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

/**
 * Closes the cached database client connection.
 */
export function closeTursoClient(): void {
  if (cachedClient) {
    try {
      cachedClient.close();
    } catch {
      // Non-fatal
    }
    cachedClient = null;
  }
}

/**
 * Initializes the Turso SQLite DDL schemas for leads, blogs, and admin_users.
 */
export async function initTursoSchema(client?: Client): Promise<void> {
  const db = client || getTursoClient();

  const ddlStatements: string[] = [
    // 1. Leads Table
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,
      reference_number TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      budget TEXT,
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
    );`,
    `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);`,
    `CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_leads_jurisdiction ON leads(jurisdiction);`,
    `CREATE INDEX IF NOT EXISTS idx_leads_reference ON leads(reference_number);`,

    // 2. Blogs Table
    `CREATE TABLE IF NOT EXISTS blogs (
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
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_pillar ON blogs(pillar);`,
    `CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(date DESC);`,

    // 3. Admin Users Table
    `CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      last_login_at TEXT
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);`,
  ];

  for (const sql of ddlStatements) {
    await db.execute(sql);
  }

  // Safe backward-compatible migration for existing leads table
  try {
    const tableInfo = await db.execute(`PRAGMA table_info(leads)`);
    const hasBudget = tableInfo.rows.some((row: any) => row.name === 'budget');
    if (!hasBudget) {
      await db.execute(`ALTER TABLE leads ADD COLUMN budget TEXT;`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column name')) {
      console.warn('[Turso Schema Migration Warning]:', err.message);
    }
  }
}

/**
 * Seeds historical leads from data/leads.jsonl into the Turso database if leads table is empty.
 * Idempotently populates 159 rows and normalizes UAE phone numbers.
 */
export async function seedHistoricalLeads(
  client?: Client,
  customJsonlPath?: string
): Promise<{ seeded: number; skipped: boolean }> {
  const db = client || getTursoClient();

  // Check if leads table already contains data
  const countResult = await db.execute('SELECT COUNT(*) as count FROM leads');
  const currentCount = Number(countResult.rows[0]?.count ?? 0);

  if (currentCount > 0) {
    return { seeded: 0, skipped: true };
  }

  const jsonlPath =
    customJsonlPath ||
    path.resolve(process.env.KLAY_DATA_DIR || path.resolve(process.cwd(), 'data'), 'leads.jsonl');

  if (!fs.existsSync(jsonlPath)) {
    console.warn(`[Turso Seed] File not found: ${jsonlPath}`);
    return { seeded: 0, skipped: true };
  }

  const fileContent = fs.readFileSync(jsonlPath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const statements: InStatement[] = [];

  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      const leadId =
        record.id || record.referenceNumber || record.reference_number || `KLAY-${Date.now()}`;
      const refNum = record.referenceNumber || record.reference_number || leadId;
      const timestamp = record.timestamp || new Date().toISOString();
      const status = record.status || 'New';
      const rawPhone = record.phone || '';
      const normalizedPhone = normalizePhoneForWhatsApp(rawPhone);

      statements.push({
        sql: `INSERT OR IGNORE INTO leads (
          id, reference_number, timestamp, name, email, phone, budget,
          jurisdiction, activity, timeline, visa_count, notes,
          source, platform, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          leadId,
          refNum,
          timestamp,
          record.name || 'Unknown',
          record.email || '',
          normalizedPhone,
          record.budget || null,
          record.jurisdiction || 'UAE',
          record.activity || 'General',
          record.timeline || null,
          typeof record.visaCount === 'number'
            ? record.visaCount
            : typeof record.visa_count === 'number'
              ? record.visa_count
              : null,
          record.notes || null,
          record.source || 'calculator',
          record.platform || 'node',
          status,
          record.created_at || timestamp,
          record.updated_at || timestamp,
        ],
      });
    } catch {
      console.warn('[Turso Seed] Malformed JSONL line:', line);
    }
  }

  // Execute in chunked batches of 50
  const CHUNK_SIZE = 50;
  let seededCount = 0;

  for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
    const chunk = statements.slice(i, i + CHUNK_SIZE);
    await db.batch(chunk, 'write');
    seededCount += chunk.length;
  }

  return { seeded: seededCount, skipped: false };
}

// Alias for specification naming compliance
export const migrateHistoricalLeads = seedHistoricalLeads;

/**
 * Bootstraps the initial administrator user if the admin_users table is empty.
 */
export async function seedInitialAdminUser(
  client?: Client
): Promise<{ seeded: boolean; username?: string }> {
  const db = client || getTursoClient();

  const countRes = await db.execute('SELECT COUNT(*) as count FROM admin_users');
  const count = Number(countRes.rows[0]?.count ?? 0);

  if (count > 0) {
    return { seeded: false };
  }

  const username = process.env.ADMIN_INITIAL_USERNAME || process.env.ADMIN_USERNAME || 'admin';
  const initialPassword =
    process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'KlayAdmin2026!Dev';

  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_INITIAL_PASSWORD) {
    throw new Error(
      'FATAL: ADMIN_INITIAL_PASSWORD must be defined in production to bootstrap the initial administrator.'
    );
  }

  const passwordHash = await bcrypt.hash(initialPassword, 10);
  const userId = `user_${crypto.randomBytes(8).toString('hex')}`;

  await db.execute({
    sql: `INSERT INTO admin_users (id, username, password_hash, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    args: [userId, username, passwordHash],
  });

  return { seeded: true, username };
}

/**
 * Inserts a lead record into the leads table with phone normalization and validation.
 */
export async function insertLead(leadOrClient: any, maybeLead?: any): Promise<any> {
  let db: Client;
  let lead: any;

  if (leadOrClient && typeof leadOrClient.execute === 'function') {
    db = leadOrClient;
    lead = maybeLead;
  } else {
    db = getTursoClient();
    lead = leadOrClient;
  }

  const id = lead.id || lead.referenceNumber || lead.reference_number || `KLAY-${Date.now()}`;
  const refNum = lead.referenceNumber || lead.reference_number || id;
  const timestamp = lead.timestamp || new Date().toISOString();
  const normalizedPhone = normalizePhoneForWhatsApp(lead.phone || '');
  const status = lead.status || 'New';

  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const result = await db.execute({
    sql: `INSERT INTO leads (
      id, reference_number, timestamp, name, email, phone, budget,
      jurisdiction, activity, timeline, visa_count, notes,
      source, platform, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      budget = COALESCE(excluded.budget, leads.budget),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    args: [
      id,
      refNum,
      timestamp,
      lead.name || 'Anonymous',
      lead.email || '',
      normalizedPhone,
      lead.budget || null,
      lead.jurisdiction || 'UAE',
      lead.activity || 'General',
      lead.timeline || null,
      typeof lead.visaCount === 'number'
        ? lead.visaCount
        : typeof lead.visa_count === 'number'
          ? lead.visa_count
          : null,
      lead.notes || null,
      lead.source || 'calculator',
      lead.platform || 'node',
      status,
      lead.created_at || timestamp,
      lead.updated_at || timestamp,
    ],
  });

  return result.rows[0] || null;
}

/**
 * Queries leads with filtering, full-text search, and pagination.
 */
export async function queryLeads(
  filtersOrClient: any,
  maybeFilters?: any
): Promise<{ leads: any[]; total: number; limit: number; offset: number }> {
  let db: Client;
  let options: LeadFilterOptions;

  if (filtersOrClient && typeof filtersOrClient.execute === 'function') {
    db = filtersOrClient;
    options = maybeFilters || {};
  } else {
    db = getTursoClient();
    options = filtersOrClient || {};
  }

  const clauses: string[] = ['1=1'];
  const args: any[] = [];

  if (options.status && options.status.trim().length > 0) {
    clauses.push('LOWER(status) = LOWER(?)');
    args.push(options.status.trim());
  }

  if (options.jurisdiction && options.jurisdiction.trim().length > 0) {
    clauses.push('LOWER(jurisdiction) LIKE LOWER(?)');
    args.push(`%${options.jurisdiction.trim()}%`);
  }

  if (options.search && options.search.trim().length > 0) {
    clauses.push(
      '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference_number LIKE ? OR id LIKE ?)'
    );
    const searchTerm = `%${options.search.trim()}%`;
    args.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
  const countRes = await db.execute({ sql: countSql, args });
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
  const queryRes = await db.execute({ sql: querySql, args: queryArgs });

  return {
    leads: queryRes.rows,
    total,
    limit,
    offset,
  };
}

/**
 * Updates lead status with whitelist validation.
 */
export async function updateLeadStatus(
  idOrClient: any,
  statusOrId?: any,
  maybeStatus?: any
): Promise<any> {
  let db: Client;
  let leadId: string;
  let newStatus: string;

  if (idOrClient && typeof idOrClient.execute === 'function') {
    db = idOrClient;
    leadId = statusOrId;
    newStatus = maybeStatus;
  } else {
    db = getTursoClient();
    leadId = idOrClient;
    newStatus = statusOrId;
  }

  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const result = await db.execute({
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

/**
 * Retrieves administrative user by username.
 */
export async function getAdminUser(usernameOrClient: any, maybeUsername?: any): Promise<any> {
  let db: Client;
  let username: string;

  if (usernameOrClient && typeof usernameOrClient.execute === 'function') {
    db = usernameOrClient;
    username = maybeUsername;
  } else {
    db = getTursoClient();
    username = usernameOrClient;
  }

  const result = await db.execute({
    sql: `SELECT * FROM admin_users WHERE username = ?`,
    args: [username],
  });

  return result.rows[0] || null;
}

// Alias for specification naming compliance
export const getAdminUserByUsername = getAdminUser;

/**
 * Retrieves all blogs ordered newest first.
 */
export async function listBlogs(client?: Client): Promise<any[]> {
  const db = client || getTursoClient();
  const result = await db.execute({
    sql: `SELECT * FROM blogs ORDER BY date DESC, created_at DESC`,
    args: [],
  });

  return result.rows;
}

// Alias for specification naming compliance
export const listAllBlogs = listBlogs;

/**
 * Upserts an article into the blogs table.
 */
export async function upsertBlog(blogOrClient: any, maybeBlog?: any): Promise<any> {
  let db: Client;
  let blog: any;

  if (blogOrClient && typeof blogOrClient.execute === 'function') {
    db = blogOrClient;
    blog = maybeBlog;
  } else {
    db = getTursoClient();
    blog = blogOrClient;
  }

  const slug = String(blog.slug || '').trim();
  const id = blog.id || `post-${slug}`;
  const date = blog.date || new Date().toISOString().split('T')[0];
  const wordCount = String(blog.content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime =
    Number(blog.readingTime || blog.reading_time) || Math.max(1, Math.ceil(wordCount / 200));

  const result = await db.execute({
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
      slug,
      blog.title || '',
      blog.pillar || '',
      readingTime,
      blog.excerpt || '',
      blog.coverImage || blog.cover_image || '',
      blog.content || '',
      blog.status || 'draft',
      date,
      blog.sanityId || blog.sanity_id || null,
    ],
  });

  return result.rows[0] || null;
}

// Alias for specification naming compliance
export const upsertBlogArticle = upsertBlog;

/**
 * Deletes a blog by slug or id.
 */
export async function deleteBlog(slugOrClient: any, maybeSlug?: any): Promise<boolean> {
  let db: Client;
  let slug: string;

  if (slugOrClient && typeof slugOrClient.execute === 'function') {
    db = slugOrClient;
    slug = maybeSlug;
  } else {
    db = getTursoClient();
    slug = slugOrClient;
  }

  const result = await db.execute({
    sql: `DELETE FROM blogs WHERE slug = ? OR id = ?`,
    args: [slug, slug],
  });

  return result.rowsAffected > 0;
}

// Alias for specification naming compliance
export const deleteBlogBySlug = deleteBlog;
