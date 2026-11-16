/**
 * Universal Admin Core Module (`netlify/functions/admin-core.cjs`)
 *
 * Shared administrative API business logic used across both:
 * 1. Express local server (`server.js`)
 * 2. Netlify serverless function (`netlify/functions/admin.cjs`)
 *
 * Implements:
 * - Pure-JS password hashing and verification with bcryptjs
 * - Signed HMAC-SHA256 session token generation and verification with crypto.timingSafeEqual
 * - Sliding-window rate limiting (max 5 failed attempts / 15 min per IP) with concurrency race mitigation
 * - Client IP resolution across Netlify CDN and Express runtime
 * - Authentication extraction & middleware (Bearer token & HttpOnly cookie)
 * - Handlers for admin login, logout, leads query & status patching, blogs CRUD
 * - Turso SQLite database persistence via @libsql/client with graceful disk fallback
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
function safeCreateLibsqlClient(config) {
  if (!config || !config.url) return null;
  const url = String(config.url).trim();
  if (url.startsWith('libsql:') || url.startsWith('https:') || url.startsWith('http:')) {
    try {
      const { createClient } = require('@libsql/client/web');
      return createClient(config);
    } catch (err) {
      console.warn('[Turso] Web client initialization failed:', err.message);
    }
  }
  try {
    const { createClient } = require('@libsql/client');
    return createClient(config);
  } catch (err) {
    console.warn('[Turso] Native libsql driver unavailable, using fallback:', err.message);
    return null;
  }
}

const SALT_ROUNDS = 10;
const REVOKED_DEVELOPMENT_PASSWORD = 'KlayAdmin2026!Dev';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// In-memory sliding-window rate limiting map: ip -> { timestamps: number[] }
const loginAttempts = new Map();

/**
 * Returns the secret key for HMAC-SHA256 session token generation.
 * Throws a fatal error if executed in production without an explicit secret.
 */
function getAdminSecret() {
  const secret = process.env.KLAY_ADMIN_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: KLAY_ADMIN_SECRET or ADMIN_JWT_SECRET must be set');
  }
  return secret;
}

/**
 * Hashes a plaintext password using bcryptjs with 10 salt rounds.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Validates a plaintext password against a bcrypt hash.
 */
async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generates a signed HMAC-SHA256 session token (Header.Payload.Signature).
 */
function generateSessionToken(username, options = {}) {
  const secret = getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY2' })).toString('base64url');

  const now = options.now !== undefined ? options.now : Math.floor(Date.now() / 1000);
  const ttl = options.ttl !== undefined ? options.ttl : 86400; // 24-hour validity
  const payloadData = {
    sub: username,
    iat: now,
    exp: now + ttl,
    jti: crypto.randomBytes(16).toString('hex'),
    ...options.extraPayload,
  };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 session token in constant time using crypto.timingSafeEqual.
 * Enforces strict numeric exp expiration validation.
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  let secret;
  try {
    secret = getAdminSecret();
  } catch {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  // Constant-time length mismatch guard
  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'KLAY2') return null;
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    const now = Math.floor(Date.now() / 1000);
    // Strict numeric exp validation
    if (
      !decodedPayload ||
      typeof decodedPayload.exp !== 'number' ||
      !Number.isFinite(decodedPayload.exp) ||
      decodedPayload.exp < now
    ) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

/**
 * Resolves client IP address across Netlify CDN and Express runtime.
 * Prioritizes Express req.ip when running in Express to prevent rate-limiter bypass
 * via client header rotation. In Netlify serverless, inspects Netlify edge connection IP headers.
 */
function resolveClientIp(reqOrEvent) {
  if (!reqOrEvent) return '127.0.0.1';

  // 1. Express runtime: strictly prioritize trusted req.ip over client-supplied headers
  if (reqOrEvent.ip) {
    return String(reqOrEvent.ip).trim();
  }

  const headers = reqOrEvent.headers || {};
  const isNetlifyServerless = Boolean(process.env.NETLIFY || reqOrEvent.httpMethod);

  // 2. Netlify serverless: inspect Netlify CDN edge connection IP headers
  if (isNetlifyServerless) {
    if (headers['x-nf-client-connection-ip']) {
      return String(headers['x-nf-client-connection-ip']).trim();
    }
    if (headers['client-ip']) {
      return String(headers['client-ip']).trim();
    }
  }

  // 3. Fallback to X-Forwarded-For if behind trusted proxy
  const forwarded = headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  if (reqOrEvent.socket && reqOrEvent.socket.remoteAddress) {
    return String(reqOrEvent.socket.remoteAddress).trim();
  }

  return '127.0.0.1';
}

/**
 * Checks sliding-window rate limit for a client IP.
 * Automatically cleans up expired Map entries to prevent memory retention leaks.
 */
function checkLoginRateLimit(ip, customNow) {
  const now = customNow !== undefined ? customNow : Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { limited: false };

  const recentAttempts = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recentAttempts.length === 0) {
    loginAttempts.delete(ip);
    return { limited: false };
  }
  record.timestamps = recentAttempts;

  if (recentAttempts.length >= MAX_FAILED_ATTEMPTS) {
    const oldest = recentAttempts[0];
    const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false };
}

/**
 * Records a failed login attempt for an IP.
 */
function recordFailedLogin(ip, customNow) {
  const now = customNow !== undefined ? customNow : Date.now();
  const record = loginAttempts.get(ip) || { timestamps: [] };
  record.timestamps.push(now);
  loginAttempts.set(ip, record);
}

/**
 * Clears failed login attempts for an IP upon successful authentication.
 */
function clearLoginRateLimit(ip) {
  loginAttempts.delete(ip);
}

/**
 * Extracts session token from Authorization Bearer header or Cookie header.
 */
function extractSessionToken(reqOrEvent) {
  if (!reqOrEvent) return null;
  const headers = reqOrEvent.headers || {};

  const authHeader = headers['authorization'] || headers['Authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = headers['cookie'] || headers['Cookie'];
  if (cookieHeader && typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/klay_admin_session=([^;]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  if (reqOrEvent.cookies && reqOrEvent.cookies.klay_admin_session) {
    return String(reqOrEvent.cookies.klay_admin_session).trim();
  }

  return null;
}

/**
 * Authentication verification returning auth status and payload.
 */
function requireAdminAuth(reqOrEvent) {
  const token = extractSessionToken(reqOrEvent);
  if (!token) {
    return {
      authenticated: false,
      status: 401,
      error: 'Unauthorized: valid admin session required',
    };
  }

  const user = verifySessionToken(token);
  if (!user) {
    return {
      authenticated: false,
      status: 401,
      error: 'Unauthorized: valid admin session required',
    };
  }

  return { authenticated: true, user };
}

/**
 * Express middleware helper for admin routes.
 */
function adminAuthMiddleware(req, res, next) {
  const auth = requireAdminAuth(req);
  if (!auth.authenticated) {
    return res.status(auth.status || 401).json({ error: auth.error || 'Unauthorized' });
  }
  req.adminUser = auth.user;
  next();
}

async function getAdminPasswordHash() {
  // No password fallback: a missing database user or environment secret must
  // never turn a public deployment into a known-credential admin account.
  return process.env.ADMIN_PASSWORD_HASH || process.env.KLAY_ADMIN_PASSWORD_HASH || null;
}

/**
 * Resolves project data directory.
 */
function resolveDataDir(customDir) {
  if (customDir) return customDir;
  if (process.env.KLAY_DATA_DIR) return process.env.KLAY_DATA_DIR;
  const projectDataDir = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(projectDataDir)) return projectDataDir;
  return '/tmp/klay-data';
}

// Turso Connection Management
let cachedAdminTursoClient = null;

function getTursoClient(options = {}) {
  if (options.client) return options.client;
  if (cachedAdminTursoClient && !options.resetCache) return cachedAdminTursoClient;

  const cloudUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (cloudUrl && cloudUrl.trim().length > 0) {
    cachedAdminTursoClient = safeCreateLibsqlClient({
      url: cloudUrl.trim(),
      authToken: authToken ? authToken.trim() : undefined,
    });
    return cachedAdminTursoClient;
  }

  try {
    const dataDir = options.dataDir || path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fall back to Tier 3
      }
    }
    const localDbPath = path.join(dataDir, 'klay.db');
    cachedAdminTursoClient = safeCreateLibsqlClient({ url: `file:${localDbPath}` });
    return cachedAdminTursoClient;
  } catch {
    const tempDbPath = path.join('/tmp', 'klay.db');
    cachedAdminTursoClient = safeCreateLibsqlClient({ url: `file:${tempDbPath}` });
    return cachedAdminTursoClient;
  }
}

let syncDb = null;

function getSyncDb(options = {}) {
  if (options.dataDir) return null; // explicit disk test dataDir bypasses default sqlite
  const dbPath = path.resolve(process.cwd(), 'data/klay.db');
  if (!fs.existsSync(dbPath)) return null;
  try {
    const { DatabaseSync } = require('node:sqlite');
    if (!syncDb) {
      syncDb = new DatabaseSync(dbPath);
    }
    const row = syncDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='leads'")
      .get();
    if (!row) return null;
    return syncDb;
  } catch {
    return null;
  }
}

/**
 * Handle POST /api/admin/login
 * Uses Turso admin_users table via @libsql/client when initialized, falling back to local credentials.
 */
async function handleAdminLogin(credentials, clientIp, options = {}) {
  if (!credentials || !credentials.username || !credentials.password) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Username and password are required' },
    };
  }

  const ip = clientIp || '127.0.0.1';

  // 1. Pre-flight rate limit check
  const rl = checkLoginRateLimit(ip);
  if (rl.limited) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rl.retryAfterSeconds),
      },
      body: {
        error: 'Too many failed attempts. Try again in 15 minutes.',
        retryAfter: rl.retryAfterSeconds,
      },
    };
  }

  // 2. IMMEDIATE ATTEMPT RESERVATION (Prevents concurrency race condition)
  recordFailedLogin(ip);

  // Revoke the credential published in earlier source releases, including
  // accounts that may already have been seeded into Turso with that password.
  if (credentials.password === REVOKED_DEVELOPMENT_PASSWORD) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Invalid username or password' },
    };
  }

  // 3. Credential verification via Turso database or local fallback
  let tursoUser = null;
  const client = options.client || getTursoClient(options);
  if (client) {
    try {
      const userRes = await client.execute({
        sql: 'SELECT * FROM admin_users WHERE username = ?',
        args: [credentials.username],
      });
      if (userRes.rows && userRes.rows.length > 0) {
        tursoUser = userRes.rows[0];
      }
    } catch {
      // Database uninitialized or table doesn't exist -> proceed to local fallback
    }
  }

  let authenticated = false;

  if (tursoUser) {
    const isPasswordMatch = await bcrypt.compare(credentials.password, tursoUser.password_hash);
    if (isPasswordMatch) {
      authenticated = true;
      try {
        await client.execute({
          sql: 'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
          args: [tursoUser.id],
        });
      } catch {
        // Non-fatal
      }
    }
  }

  if (!authenticated) {
    // An explicit environment credential can recover an existing Turso admin
    // whose old password was revoked or rotated.
    const expectedUsername =
      process.env.ADMIN_INITIAL_USERNAME || process.env.ADMIN_USERNAME || 'admin';
    const expectedHash = await getAdminPasswordHash();

    const isUsernameMatch = credentials.username === expectedUsername;
    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      isUsernameMatch && expectedHash
        ? expectedHash
        : '$2a$10$wT2eXoXo0Jv8.gQ7UoVqxeYQW1kF5JtD4iQpG8uE7W8a6Z7y8w0eO'
    );
    if (isUsernameMatch && expectedHash && isPasswordMatch) {
      authenticated = true;
    }
  }

  if (!authenticated) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Invalid username or password' },
    };
  }

  // 4. Success handling: clear rate limit and issue token & cookie
  clearLoginRateLimit(ip);

  const token = generateSessionToken(credentials.username);
  const isProd = Boolean(process.env.NETLIFY) || process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  const cookieHeader = `klay_admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secureFlag}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
    body: {
      ok: true,
      user: {
        username: credentials.username,
      },
    },
  };
}

/**
 * Handle POST /api/admin/logout
 */
function handleAdminLogout() {
  const isProd = Boolean(process.env.NETLIFY) || process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  const cookieHeader = `klay_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
    body: {
      ok: true,
      message: 'Logged out successfully',
    },
  };
}

/**
 * Read and normalize leads from data/leads.jsonl
 */
function readLeadsFromDisk(options = {}) {
  const dataDir = resolveDataDir(options.dataDir);
  const jsonlPath = path.join(dataDir, 'leads.jsonl');

  if (!fs.existsSync(jsonlPath)) {
    return [];
  }

  const raw = fs.readFileSync(jsonlPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const leads = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      const id =
        parsed.id || parsed.referenceNumber || parsed.reference_number || `KLAY-${Date.now()}`;
      const referenceNumber = parsed.referenceNumber || parsed.reference_number || id;
      const timestamp = parsed.timestamp || new Date().toISOString();

      leads.push({
        id,
        reference_number: referenceNumber,
        referenceNumber,
        timestamp,
        name: parsed.name || 'Anonymous',
        email: parsed.email || '',
        phone: parsed.phone || '',
        jurisdiction: parsed.jurisdiction || 'UAE',
        activity: parsed.activity || 'General',
        timeline: parsed.timeline || null,
        visa_count: parsed.visaCount !== undefined ? parsed.visaCount : parsed.visa_count || null,
        visaCount: parsed.visaCount !== undefined ? parsed.visaCount : parsed.visa_count || null,
        notes: parsed.notes || null,
        source: parsed.source || 'calculator',
        platform: parsed.platform || 'node',
        status: parsed.status || 'New',
        created_at: parsed.created_at || timestamp,
        updated_at: parsed.updated_at || timestamp,
      });
    } catch {
      // Ignore malformed line
    }
  }

  return leads;
}

/**
 * Writes array of lead objects back to data/leads.jsonl (and leads.json)
 */
function writeLeadsToDisk(leads, options = {}) {
  const dataDir = resolveDataDir(options.dataDir);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const jsonlPath = path.join(dataDir, 'leads.jsonl');
  const jsonPath = path.join(dataDir, 'leads.json');

  const content = leads.map((l) => JSON.stringify(l)).join('\n') + '\n';
  fs.writeFileSync(jsonlPath, content, 'utf8');

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(leads, null, 2), 'utf8');
  } catch {
    // Non-fatal
  }
}

/**
 * Disk fallback for handleGetLeads
 */
function handleGetLeadsDisk(filters = {}, options = {}) {
  const allLeads = readLeadsFromDisk(options);

  let filtered = allLeads.filter((lead) => {
    if (filters.status && filters.status.trim().length > 0) {
      if (lead.status.toLowerCase() !== filters.status.trim().toLowerCase()) {
        return false;
      }
    }

    if (filters.jurisdiction && filters.jurisdiction.trim().length > 0) {
      const leadJur = (lead.jurisdiction || '').toLowerCase();
      const filterJur = filters.jurisdiction.trim().toLowerCase();
      if (!leadJur.includes(filterJur)) {
        return false;
      }
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      const match = [
        lead.name,
        lead.email,
        lead.phone,
        lead.reference_number,
        lead.referenceNumber,
        lead.id,
      ].some((val) =>
        String(val || '')
          .toLowerCase()
          .includes(q)
      );
      if (!match) return false;
    }

    if (filters.from) {
      const fromTime = new Date(filters.from).getTime();
      const leadTime = new Date(lead.timestamp).getTime();
      if (!Number.isNaN(fromTime) && leadTime < fromTime) {
        return false;
      }
    }

    if (filters.to) {
      const toTime = new Date(filters.to).getTime();
      const leadTime = new Date(lead.timestamp).getTime();
      if (!Number.isNaN(toTime) && leadTime > toTime) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filtered.length;
  const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
  const offset = Math.max(Number(filters.offset) || 0, 0);

  const page = filtered.slice(offset, offset + limit);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      leads: page,
      total,
      limit,
      offset,
    },
  };
}

/**
 * Async Turso retrieval for leads using @libsql/client
 */
async function handleGetLeadsTurso(filters = {}, options = {}) {
  try {
    const client = options.client || getTursoClient(options);
    if (!client) {
      return handleGetLeadsDisk(filters, options);
    }
    const clauses = ['1=1'];
    const args = [];

    if (filters.status && filters.status.trim().length > 0) {
      clauses.push('LOWER(status) = LOWER(?)');
      args.push(filters.status.trim());
    }

    if (filters.jurisdiction && filters.jurisdiction.trim().length > 0) {
      clauses.push('LOWER(jurisdiction) LIKE LOWER(?)');
      args.push(`%${filters.jurisdiction.trim()}%`);
    }

    if (filters.search && filters.search.trim().length > 0) {
      clauses.push(
        '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference_number LIKE ? OR id LIKE ?)'
      );
      const searchTerm = `%${filters.search.trim()}%`;
      args.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.from) {
      clauses.push('timestamp >= ?');
      args.push(filters.from);
    }

    if (filters.to) {
      clauses.push('timestamp <= ?');
      args.push(filters.to);
    }

    const whereClause = clauses.join(' AND ');
    const countRes = await client.execute({
      sql: `SELECT COUNT(*) as total FROM leads WHERE ${whereClause}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = Math.max(Number(filters.offset) || 0, 0);

    const querySql = `
      SELECT * FROM leads
      WHERE ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const queryArgs = [...args, limit, offset];
    const queryRes = await client.execute({ sql: querySql, args: queryArgs });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        leads: queryRes.rows,
        total,
        limit,
        offset,
      },
    };
  } catch (err) {
    console.warn('[Turso handleGetLeadsTurso fallback to disk]:', err.message);
    return handleGetLeadsDisk(filters, options);
  }
}

/**
 * Handle GET /api/admin/leads
 * Routes between Turso database and local file fallback.
 */
function handleGetLeads(filters = {}, options = {}) {
  if (
    options.useTurso ||
    options.async ||
    (options.client && typeof options.client.execute === 'function')
  ) {
    return handleGetLeadsTurso(filters, options);
  }

  const sdb = getSyncDb(options);
  if (!sdb) {
    return handleGetLeadsDisk(filters, options);
  }

  try {
    const clauses = ['1=1'];
    const args = [];

    if (filters.status && filters.status.trim().length > 0) {
      clauses.push('LOWER(status) = LOWER(?)');
      args.push(filters.status.trim());
    }

    if (filters.jurisdiction && filters.jurisdiction.trim().length > 0) {
      clauses.push('LOWER(jurisdiction) LIKE LOWER(?)');
      args.push(`%${filters.jurisdiction.trim()}%`);
    }

    if (filters.search && filters.search.trim().length > 0) {
      clauses.push(
        '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference_number LIKE ? OR id LIKE ?)'
      );
      const searchTerm = `%${filters.search.trim()}%`;
      args.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.from) {
      clauses.push('timestamp >= ?');
      args.push(filters.from);
    }

    if (filters.to) {
      clauses.push('timestamp <= ?');
      args.push(filters.to);
    }

    const whereClause = clauses.join(' AND ');
    const countRow = sdb
      .prepare(`SELECT COUNT(*) as total FROM leads WHERE ${whereClause}`)
      .get(...args);
    const total = Number(countRow?.total ?? 0);

    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = Math.max(Number(filters.offset) || 0, 0);

    const querySql = `
      SELECT * FROM leads
      WHERE ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const rows = sdb.prepare(querySql).all(...args, limit, offset);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        leads: rows,
        total,
        limit,
        offset,
      },
    };
  } catch (err) {
    console.warn('[Turso Sync handleGetLeads fallback to disk]:', err.message);
    return handleGetLeadsDisk(filters, options);
  }
}

/**
 * Disk fallback for handlePatchLead
 */
function handlePatchLeadDisk(id, updates = {}, options = {}) {
  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];

  if (!updates || !updates.status || !VALID_STATUSES.includes(updates.status)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Invalid status: must be one of New, Contacted, Proposal Sent, Converted, Archived',
      },
    };
  }

  const allLeads = readLeadsFromDisk(options);
  const targetIndex = allLeads.findIndex(
    (l) => l.id === id || l.referenceNumber === id || l.reference_number === id
  );

  if (targetIndex === -1) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Lead not found' },
    };
  }

  const lead = allLeads[targetIndex];
  lead.status = updates.status;
  lead.updated_at = new Date().toISOString();
  allLeads[targetIndex] = lead;

  writeLeadsToDisk(allLeads, options);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      ok: true,
      lead: {
        id: lead.id,
        reference_number: lead.reference_number || lead.referenceNumber || lead.id,
        status: lead.status,
        updated_at: lead.updated_at,
      },
    },
  };
}

/**
 * Async Turso lead status patch using @libsql/client
 */
async function handlePatchLeadTurso(id, updates = {}, options = {}) {
  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];
  if (!updates || !updates.status || !VALID_STATUSES.includes(updates.status)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Invalid status: must be one of New, Contacted, Proposal Sent, Converted, Archived',
      },
    };
  }

  try {
    const client = options.client || getTursoClient(options);
    if (!client) {
      return handlePatchLeadDisk(id, updates, options);
    }

    const result = await client.execute({
      sql: `UPDATE leads
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? OR reference_number = ?
            RETURNING *`,
      args: [updates.status, id, id],
    });

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Lead not found' },
      };
    }

    const lead = result.rows[0];
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        lead: {
          id: lead.id,
          reference_number: lead.reference_number || lead.referenceNumber || lead.id,
          status: lead.status,
          updated_at: lead.updated_at,
        },
      },
    };
  } catch (err) {
    console.warn('[Turso handlePatchLeadTurso fallback to disk]:', err.message);
    return handlePatchLeadDisk(id, updates, options);
  }
}

/**
 * Handle PATCH /api/admin/leads/:id
 */
function handlePatchLead(id, updates = {}, options = {}) {
  const VALID_STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];

  if (!updates || !updates.status || !VALID_STATUSES.includes(updates.status)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Invalid status: must be one of New, Contacted, Proposal Sent, Converted, Archived',
      },
    };
  }

  if (
    options.useTurso ||
    options.async ||
    (options.client && typeof options.client.execute === 'function')
  ) {
    return handlePatchLeadTurso(id, updates, options);
  }

  const sdb = getSyncDb(options);
  if (!sdb) {
    return handlePatchLeadDisk(id, updates, options);
  }

  try {
    const updatedLead = sdb
      .prepare(
        `
      UPDATE leads
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR reference_number = ?
      RETURNING *
    `
      )
      .get(updates.status, id, id);

    if (!updatedLead) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Lead not found' },
      };
    }

    try {
      handlePatchLeadDisk(id, updates, options);
    } catch {
      // Non-fatal
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        lead: {
          id: updatedLead.id,
          reference_number: updatedLead.reference_number || updatedLead.id,
          status: updatedLead.status,
          updated_at: updatedLead.updated_at,
        },
      },
    };
  } catch (err) {
    console.warn('[Turso Sync handlePatchLead fallback to disk]:', err.message);
    return handlePatchLeadDisk(id, updates, options);
  }
}

// Initial seed blogs if storage is empty
const DEFAULT_INITIAL_BLOGS = [
  {
    id: 'post-uae-corporate-tax-guide-2026',
    slug: 'uae-corporate-tax-guide-2026',
    title: 'UAE Corporate Tax Guide 2026: Comprehensive Executive Briefing',
    pillar: 'Corporate Tax',
    reading_time: 6,
    readingTime: 6,
    excerpt:
      'Executive analysis on qualifying free zone persons and domestic minimum top-up taxes.',
    cover_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    content:
      '## Executive Summary\nThe UAE Corporate Tax regime applies a standard 9% rate to taxable business profits above AED 375,000.',
    status: 'published',
    date: '2026-11-15',
    sanity_id: 'post-uae-corporate-tax-guide-2026',
    created_at: '2026-11-15 12:00:00',
    updated_at: '2026-11-15 12:00:00',
  },
  {
    id: 'post-difc-prescribed-company-structuring-2026',
    slug: 'difc-prescribed-company-structuring-2026',
    title: 'DIFC Prescribed Company Structuring 2026',
    pillar: 'Corporate Structuring',
    reading_time: 5,
    readingTime: 5,
    excerpt: 'How to deploy SPVs and holding vehicles in the Dubai International Financial Centre.',
    cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    content:
      '## Introduction\nDIFC Prescribed Companies provide a flexible regime for regional asset holding and investment.',
    status: 'published',
    date: '2026-11-15',
    sanity_id: 'post-difc-prescribed-company-structuring-2026',
    created_at: '2026-11-15 12:00:00',
    updated_at: '2026-11-15 12:00:00',
  },
];

function readBlogsFromDisk(options = {}) {
  const dataDir = resolveDataDir(options.dataDir);
  const blogsPath = path.join(dataDir, 'blogs.json');

  if (!fs.existsSync(blogsPath)) {
    writeBlogsToDisk(DEFAULT_INITIAL_BLOGS, options);
    return [...DEFAULT_INITIAL_BLOGS];
  }

  try {
    const raw = fs.readFileSync(blogsPath, 'utf8');
    const blogs = JSON.parse(raw);
    return Array.isArray(blogs) ? blogs : [];
  } catch {
    return [...DEFAULT_INITIAL_BLOGS];
  }
}

function writeBlogsToDisk(blogs, options = {}) {
  const dataDir = resolveDataDir(options.dataDir);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const blogsPath = path.join(dataDir, 'blogs.json');
  fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf8');
}

/**
 * Disk fallback for handleGetBlogs
 */
function handleGetBlogsDisk(options = {}) {
  const blogs = readBlogsFromDisk(options);
  blogs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { blogs },
  };
}

/**
 * Async Turso blogs retrieval using @libsql/client
 */
async function handleGetBlogsTurso(options = {}) {
  try {
    const client = options.client || getTursoClient(options);
    if (!client) {
      return handleGetBlogsDisk(options);
    }
    const result = await client.execute({
      sql: `SELECT * FROM blogs ORDER BY date DESC, created_at DESC`,
      args: [],
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { blogs: result.rows },
    };
  } catch (err) {
    console.warn('[Turso handleGetBlogsTurso fallback to disk]:', err.message);
    return handleGetBlogsDisk(options);
  }
}

/**
 * Handle GET /api/admin/blogs
 */
function handleGetBlogs(options = {}) {
  if (
    options.useTurso ||
    options.async ||
    (options.client && typeof options.client.execute === 'function')
  ) {
    return handleGetBlogsTurso(options);
  }

  const sdb = getSyncDb(options);
  if (!sdb) {
    return handleGetBlogsDisk(options);
  }

  try {
    const rows = sdb.prepare(`SELECT * FROM blogs ORDER BY date DESC, created_at DESC`).all();
    if (rows && rows.length > 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { blogs: rows },
      };
    }
    return handleGetBlogsDisk(options);
  } catch (err) {
    console.warn('[Turso Sync handleGetBlogs fallback to disk]:', err.message);
    return handleGetBlogsDisk(options);
  }
}

/**
 * Disk fallback for handlePostBlog
 */
function handlePostBlogDisk(data = {}, options = {}) {
  const slug = String(data.slug).trim();
  const id = data.id || `post-${slug}`;
  const wordCount = String(data.content).trim().split(/\s+/).filter(Boolean).length;
  const readingTime =
    Number(data.readingTime || data.reading_time) || Math.max(1, Math.ceil(wordCount / 200));
  const date = data.date || new Date().toISOString().split('T')[0];
  const status = data.status === 'published' ? 'published' : 'draft';

  const blogs = readBlogsFromDisk(options);
  const existingIndex = blogs.findIndex((b) => b.slug === slug || b.id === id);

  const blogRecord = {
    id,
    slug,
    title: String(data.title).trim(),
    pillar: String(data.pillar).trim(),
    reading_time: readingTime,
    readingTime,
    excerpt: data.excerpt ? String(data.excerpt).trim() : '',
    cover_image: data.coverImage || data.cover_image || '',
    coverImage: data.coverImage || data.cover_image || '',
    content: String(data.content),
    status,
    date,
    sanity_id: data.sanityId || data.sanity_id || id,
    sanityId: data.sanityId || data.sanity_id || id,
    created_at: existingIndex >= 0 ? blogs[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    blogs[existingIndex] = blogRecord;
  } else {
    blogs.unshift(blogRecord);
  }

  writeBlogsToDisk(blogs, options);

  return {
    statusCode: existingIndex >= 0 ? 200 : 201,
    headers: { 'Content-Type': 'application/json' },
    body: {
      ok: true,
      blog: blogRecord,
      sanitySynced: false,
    },
  };
}

/**
 * Async Turso blog creation/update using @libsql/client
 */
async function handlePostBlogTurso(data = {}, options = {}) {
  if (!data || !data.title || !data.slug || !data.pillar || !data.content) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: "Validation failed: 'title', 'slug', 'pillar', and 'content' are required fields",
      },
    };
  }

  const slug = String(data.slug).trim();
  const id = data.id || `post-${slug}`;
  const wordCount = String(data.content).trim().split(/\s+/).filter(Boolean).length;
  const readingTime =
    Number(data.readingTime || data.reading_time) || Math.max(1, Math.ceil(wordCount / 200));
  const date = data.date || new Date().toISOString().split('T')[0];
  const status = data.status === 'published' ? 'published' : 'draft';

  try {
    const client = options.client || getTursoClient(options);
    if (!client) {
      return handlePostBlogDisk(data, options);
    }

    const checkRes = await client.execute({
      sql: `SELECT id FROM blogs WHERE slug = ? OR id = ?`,
      args: [slug, id],
    });
    const isUpdate = checkRes.rows.length > 0;

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
        slug,
        String(data.title).trim(),
        String(data.pillar).trim(),
        readingTime,
        data.excerpt ? String(data.excerpt).trim() : '',
        data.coverImage || data.cover_image || '',
        String(data.content),
        status,
        date,
        data.sanityId || data.sanity_id || id,
      ],
    });

    const blogRecord = result.rows[0];
    return {
      statusCode: isUpdate ? 200 : 201,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        blog: blogRecord,
        sanitySynced: false,
      },
    };
  } catch (err) {
    console.warn('[Turso handlePostBlogTurso fallback to disk]:', err.message);
    return handlePostBlogDisk(data, options);
  }
}

/**
 * Handle POST /api/admin/blogs
 */
function handlePostBlog(data = {}, options = {}) {
  if (!data || !data.title || !data.slug || !data.pillar || !data.content) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: "Validation failed: 'title', 'slug', 'pillar', and 'content' are required fields",
      },
    };
  }

  if (
    options.useTurso ||
    options.async ||
    (options.client && typeof options.client.execute === 'function')
  ) {
    return handlePostBlogTurso(data, options);
  }

  const sdb = getSyncDb(options);
  if (!sdb) {
    return handlePostBlogDisk(data, options);
  }

  const slug = String(data.slug).trim();
  const id = data.id || `post-${slug}`;
  const wordCount = String(data.content).trim().split(/\s+/).filter(Boolean).length;
  const readingTime =
    Number(data.readingTime || data.reading_time) || Math.max(1, Math.ceil(wordCount / 200));
  const date = data.date || new Date().toISOString().split('T')[0];
  const status = data.status === 'published' ? 'published' : 'draft';

  try {
    const checkRow = sdb.prepare(`SELECT id FROM blogs WHERE slug = ? OR id = ?`).get(slug, id);
    const isUpdate = Boolean(checkRow);

    const savedBlog = sdb
      .prepare(
        `
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
    `
      )
      .get(
        id,
        slug,
        String(data.title).trim(),
        String(data.pillar).trim(),
        readingTime,
        data.excerpt ? String(data.excerpt).trim() : '',
        data.coverImage || data.cover_image || '',
        String(data.content),
        status,
        date,
        data.sanityId || data.sanity_id || id
      );

    try {
      handlePostBlogDisk(data, options);
    } catch {
      // Non-fatal
    }

    return {
      statusCode: isUpdate ? 200 : 201,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        blog: savedBlog,
        sanitySynced: false,
      },
    };
  } catch (err) {
    console.warn('[Turso Sync handlePostBlog fallback to disk]:', err.message);
    return handlePostBlogDisk(data, options);
  }
}

/**
 * Disk fallback for handleDeleteBlog
 */
function handleDeleteBlogDisk(slug, options = {}) {
  const blogs = readBlogsFromDisk(options);
  const targetIndex = blogs.findIndex((b) => b.slug === slug || b.id === slug);

  if (targetIndex === -1) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Blog article not found' },
    };
  }

  blogs.splice(targetIndex, 1);
  writeBlogsToDisk(blogs, options);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      ok: true,
      deleted: slug,
    },
  };
}

/**
 * Async Turso blog deletion using @libsql/client
 */
async function handleDeleteBlogTurso(slug, options = {}) {
  if (!slug) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Blog slug is required' },
    };
  }

  try {
    const client = options.client || getTursoClient(options);
    if (!client) {
      return handleDeleteBlogDisk(slug, options);
    }

    const result = await client.execute({
      sql: `DELETE FROM blogs WHERE slug = ? OR id = ?`,
      args: [slug, slug],
    });

    if (result.rowsAffected === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Blog article not found' },
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        deleted: slug,
      },
    };
  } catch (err) {
    console.warn('[Turso handleDeleteBlogTurso fallback to disk]:', err.message);
    return handleDeleteBlogDisk(slug, options);
  }
}

/**
 * Handle DELETE /api/admin/blogs/:slug
 */
function handleDeleteBlog(slug, options = {}) {
  if (!slug) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Blog slug is required' },
    };
  }

  if (
    options.useTurso ||
    options.async ||
    (options.client && typeof options.client.execute === 'function')
  ) {
    return handleDeleteBlogTurso(slug, options);
  }

  const sdb = getSyncDb(options);
  if (!sdb) {
    return handleDeleteBlogDisk(slug, options);
  }

  try {
    const checkRow = sdb.prepare(`SELECT id FROM blogs WHERE slug = ? OR id = ?`).get(slug, slug);
    if (!checkRow) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Blog article not found' },
      };
    }

    sdb.prepare(`DELETE FROM blogs WHERE slug = ? OR id = ?`).run(slug, slug);

    try {
      handleDeleteBlogDisk(slug, options);
    } catch {
      // Non-fatal
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        deleted: slug,
      },
    };
  } catch (err) {
    console.warn('[Turso Sync handleDeleteBlog fallback to disk]:', err.message);
    return handleDeleteBlogDisk(slug, options);
  }
}

module.exports = {
  // Constants
  REVOKED_DEVELOPMENT_PASSWORD,
  RATE_LIMIT_WINDOW_MS,
  MAX_FAILED_ATTEMPTS,

  // Cryptography & Secrets
  getAdminSecret,
  hashPassword,
  verifyPassword,
  generateSessionToken,
  verifySessionToken,

  // Rate Limiting
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  _loginAttemptsMap: loginAttempts,

  // Request & Auth Helpers
  resolveClientIp,
  extractSessionToken,
  requireAdminAuth,
  adminAuthMiddleware,

  // Turso Helpers
  getTursoClient,

  // Handlers (with Turso + Disk Fallback)
  handleAdminLogin,
  handleAdminLogout,
  handleGetLeads,
  handlePatchLead,
  handleGetBlogs,
  handlePostBlog,
  handleDeleteBlog,

  // Turso Direct Handlers
  handleGetLeadsTurso,
  handlePatchLeadTurso,
  handleGetBlogsTurso,
  handlePostBlogTurso,
  handleDeleteBlogTurso,

  // Disk I/O Helpers
  readLeadsFromDisk,
  writeLeadsToDisk,
  readBlogsFromDisk,
  writeBlogsToDisk,
};
