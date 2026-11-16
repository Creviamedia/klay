/**
 * Comprehensive Verification Suite: Turso Database & Telegram Telemetry
 * (`scripts/test-turso-telegram.mjs`)
 *
 * Verifies Phase 3 / Milestone 3 requirements:
 * 1. Multi-tier Turso connection factory & target resolution
 * 2. SQLite DDL schema creation & constraints (leads, blogs, admin_users)
 * 3. 159-row historical leads migration from data/leads.jsonl with idempotent re-run
 * 4. UAE phone number normalization (05... -> 9715...) for WhatsApp compatibility
 * 5. Initial administrator user bootstrap with bcryptjs password hashing
 * 6. Turso database operations (insertLead, queryLeads, updateLeadStatus, getAdminUser, listBlogs, upsertBlog, deleteBlog)
 * 7. Universal lead intake integration with Turso persistence in netlify/functions/lead-intake-core.cjs
 * 8. Telegram outbound alert generation: HTML phone dialer, WhatsApp inline button, entity escaping, truncation
 * 9. Telegram protocol compliance (NO tel: in InlineKeyboardButton.url, 5s timeout isolation)
 * 10. Admin Core handlers wiring to Turso with fallback
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

import {
  resolveDatabaseTarget,
  getTursoClient,
  initTursoSchema,
  seedHistoricalLeads,
  seedInitialAdminUser,
  insertLead,
  queryLeads,
  updateLeadStatus,
  getAdminUser,
  listBlogs,
  upsertBlog,
  deleteBlog,
  normalizePhoneForWhatsApp,
} from '../src/lib/turso.ts';

const require = createRequire(import.meta.url);
const leadIntakeCore = require('../netlify/functions/lead-intake-core.cjs');
const adminCore = require('../netlify/functions/admin-core.cjs');

console.log('======================================================================');
console.log('🏛️  KLAY TURSO DATABASE & TELEGRAM TELEMETRY VERIFICATION SUITE  🏛️');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ name, error: err.message, stack: err.stack });
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ name, error: err.message, stack: err.stack });
  }
}

// Create an isolated temporary test database file for reproducible, zero-collision testing
const testDbDir = path.join('/tmp', `klay-turso-test-${Date.now()}`);
fs.mkdirSync(testDbDir, { recursive: true });
const testDbPath = path.join(testDbDir, 'test-klay.db');
const testClient = createClient({ url: `file:${testDbPath}` });

// ============================================================================
// SUITE 1: CONNECTION FACTORY & TARGET RESOLUTION
// ============================================================================
console.log('--- SUITE 1: Connection Factory & Target Resolution ---');

test('1.1 resolveDatabaseTarget returns local-file tier when no remote URL provided', () => {
  const prevUrl = process.env.TURSO_DATABASE_URL;
  try {
    delete process.env.TURSO_DATABASE_URL;
    const target = resolveDatabaseTarget();
    assert.strictEqual(target.tier, 'local-file');
    assert.ok(target.url.startsWith('file:'));
    assert.ok(target.url.includes('klay.db'));
  } finally {
    if (prevUrl) process.env.TURSO_DATABASE_URL = prevUrl;
  }
});

test('1.2 resolveDatabaseTarget returns cloud tier when TURSO_DATABASE_URL is set', () => {
  const prevUrl = process.env.TURSO_DATABASE_URL;
  const prevToken = process.env.TURSO_AUTH_TOKEN;
  try {
    process.env.TURSO_DATABASE_URL = 'libsql://klay-test.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'test-token-123';
    const target = resolveDatabaseTarget();
    assert.strictEqual(target.tier, 'cloud');
    assert.strictEqual(target.url, 'libsql://klay-test.turso.io');
    assert.strictEqual(target.authToken, 'test-token-123');
  } finally {
    if (prevUrl) process.env.TURSO_DATABASE_URL = prevUrl;
    else delete process.env.TURSO_DATABASE_URL;
    if (prevToken) process.env.TURSO_AUTH_TOKEN = prevToken;
    else delete process.env.TURSO_AUTH_TOKEN;
  }
});

await testAsync('1.3 Libsql test client executes basic query successfully', async () => {
  const res = await testClient.execute('SELECT 42 as answer');
  assert.strictEqual(Number(res.rows[0].answer), 42);
});

// ============================================================================
// SUITE 2: DDL SCHEMA CREATION & CONSTRAINTS
// ============================================================================
console.log('\n--- SUITE 2: DDL Schema Creation & SQLite Constraints ---');

await testAsync(
  '2.1 initTursoSchema creates leads, blogs, and admin_users tables and indexes',
  async () => {
    await initTursoSchema(testClient);

    const tablesRes = await testClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('leads', 'blogs', 'admin_users')"
    );
    const tableNames = tablesRes.rows.map((r) => r.name);
    assert.ok(tableNames.includes('leads'), 'leads table must exist');
    assert.ok(tableNames.includes('blogs'), 'blogs table must exist');
    assert.ok(tableNames.includes('admin_users'), 'admin_users table must exist');
  }
);

await testAsync('2.2 leads table enforces CHECK constraint on lifecycle status', async () => {
  // Valid status passes
  await testClient.execute({
    sql: `INSERT INTO leads (id, reference_number, timestamp, name, email, phone, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'KLAY-TEST-VALID',
      'KLAY-TEST-VALID',
      new Date().toISOString(),
      'Valid Lead',
      'v@test.com',
      '+971501112233',
      'New',
    ],
  });

  // Invalid status throws LibsqlError (CHECK constraint failure)
  let threw = false;
  try {
    await testClient.execute({
      sql: `INSERT INTO leads (id, reference_number, timestamp, name, email, phone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'KLAY-TEST-INVALID',
        'KLAY-TEST-INVALID',
        new Date().toISOString(),
        'Invalid Lead',
        'i@test.com',
        '+971501112233',
        'InvalidStatus',
      ],
    });
  } catch {
    threw = true;
  }
  assert.strictEqual(threw, true, 'CHECK constraint must reject invalid status');
});

await testAsync(
  '2.3 blogs table enforces CHECK constraint on status and UNIQUE on slug',
  async () => {
    // Valid blog passes
    await testClient.execute({
      sql: `INSERT INTO blogs (id, slug, title, pillar, reading_time, content, status, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'post-test-1',
        'test-article-1',
        'Test 1',
        'Corporate Tax',
        3,
        'Content',
        'draft',
        '2026-11-15',
      ],
    });

    // Invalid status throws
    let threwCheck = false;
    try {
      await testClient.execute({
        sql: `INSERT INTO blogs (id, slug, title, pillar, reading_time, content, status, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'post-test-2',
          'test-article-2',
          'Test 2',
          'Corporate Tax',
          3,
          'Content',
          'archived',
          '2026-11-15',
        ],
      });
    } catch {
      threwCheck = true;
    }
    assert.strictEqual(threwCheck, true, 'CHECK constraint must reject invalid blog status');

    // Duplicate slug throws UNIQUE constraint
    let threwUnique = false;
    try {
      await testClient.execute({
        sql: `INSERT INTO blogs (id, slug, title, pillar, reading_time, content, status, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'post-test-3',
          'test-article-1',
          'Duplicate Slug',
          'Corporate Tax',
          3,
          'Content',
          'published',
          '2026-11-15',
        ],
      });
    } catch {
      threwUnique = true;
    }
    assert.strictEqual(threwUnique, true, 'UNIQUE index on slug must reject duplicate');
  }
);

await testAsync('2.4 admin_users table enforces UNIQUE index on username', async () => {
  await testClient.execute({
    sql: `INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)`,
    args: [
      'user-1',
      'unique_admin',
      '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
    ],
  });

  let threw = false;
  try {
    await testClient.execute({
      sql: `INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)`,
      args: [
        'user-2',
        'unique_admin',
        '$2a$10$anotherhash1234567890abcdefghijklmnopqrstuvwxyzabcdef',
      ],
    });
  } catch {
    threw = true;
  }
  assert.strictEqual(threw, true, 'admin_users table must reject duplicate username');
});

// ============================================================================
// SUITE 3: HISTORICAL SEED MIGRATION & PHONE NORMALIZATION
// ============================================================================
console.log('\n--- SUITE 3: Historical Leads Seed Migration & Phone Normalization ---');

test('3.1 normalizePhoneForWhatsApp normalizes UAE local 05... to 9715...', () => {
  assert.strictEqual(normalizePhoneForWhatsApp('0501234567'), '971501234567');
  assert.strictEqual(normalizePhoneForWhatsApp('052 987 6543'), '971529876543');
  assert.strictEqual(normalizePhoneForWhatsApp('+971 50 123 4567'), '+971 50 123 4567');
  assert.strictEqual(normalizePhoneForWhatsApp('+44 7911 123456'), '+44 7911 123456');
  assert.strictEqual(normalizePhoneForWhatsApp('9710501234567'), '971501234567');
  assert.strictEqual(normalizePhoneForWhatsApp(null), '');
  assert.strictEqual(normalizePhoneForWhatsApp(''), '');
});

// Create fresh database for full 159-seed verification
const seedDbPath = path.join(testDbDir, 'seed-klay.db');
const seedClient = createClient({ url: `file:${seedDbPath}` });
await initTursoSchema(seedClient);

await testAsync('3.2 seedHistoricalLeads migrates 159 rows from data/leads.jsonl', async () => {
  const result = await seedHistoricalLeads(seedClient);
  assert.strictEqual(result.skipped, false);
  assert.strictEqual(result.seeded, 159);

  const countRes = await seedClient.execute('SELECT COUNT(*) as total FROM leads');
  assert.strictEqual(Number(countRes.rows[0].total), 159);
});

await testAsync('3.3 seedHistoricalLeads is idempotent on re-execution', async () => {
  const reRunResult = await seedHistoricalLeads(seedClient);
  assert.strictEqual(reRunResult.skipped, true);
  assert.strictEqual(reRunResult.seeded, 0);

  const countRes = await seedClient.execute('SELECT COUNT(*) as total FROM leads');
  assert.strictEqual(Number(countRes.rows[0].total), 159);
});

await testAsync(
  '3.4 Verifies UAE phone normalization stored in database for historical burst leads',
  async () => {
    // In data/leads.jsonl, lines 7-15 contain burst leads with phone "0501234567"
    const burstRes = await seedClient.execute({
      sql: `SELECT phone FROM leads WHERE name = 'Burst Lead 0'`,
    });
    assert.ok(burstRes.rows.length >= 1, 'Burst Lead 0 records must be present');
    assert.ok(
      burstRes.rows.every((r) => r.phone === '971501234567'),
      'Local UAE 05... phone must be stored as 9715... in Turso leads table'
    );
  }
);

// ============================================================================
// SUITE 4: INITIAL ADMIN USER BOOTSTRAP
// ============================================================================
console.log('\n--- SUITE 4: Initial Admin User Bootstrap ---');

await testAsync(
  '4.1 seedInitialAdminUser creates default admin user when table is empty',
  async () => {
    const res = await seedInitialAdminUser(seedClient);
    assert.strictEqual(res.seeded, true);
    assert.strictEqual(res.username, 'admin');

    const user = await getAdminUser(seedClient, 'admin');
    assert.ok(user);
    assert.strictEqual(user.username, 'admin');
    assert.ok(user.password_hash.startsWith('$2a$10$') || user.password_hash.startsWith('$2b$10$'));

    const passMatch = await bcrypt.compare('KlayAdmin2026!Dev', user.password_hash);
    assert.strictEqual(passMatch, true);
  }
);

await testAsync('4.2 seedInitialAdminUser is idempotent on re-execution', async () => {
  const res = await seedInitialAdminUser(seedClient);
  assert.strictEqual(res.seeded, false);
});

// ============================================================================
// SUITE 5: TURSO DATABASE OPERATIONS (CRUD)
// ============================================================================
console.log('\n--- SUITE 5: Turso Database Operations (CRUD) ---');

await testAsync('5.1 insertLead inserts lead and normalizes phone number', async () => {
  const leadData = {
    id: 'KLAY-MANUAL-001',
    name: 'Tariq Al-Hashemi',
    email: 'tariq@holding.ae',
    phone: '055 123 4567',
    jurisdiction: 'ADGM',
    activity: 'Wealth Management',
    status: 'New',
  };

  const inserted = await insertLead(seedClient, leadData);
  assert.ok(inserted);
  assert.strictEqual(inserted.id, 'KLAY-MANUAL-001');
  assert.strictEqual(inserted.phone, '971551234567');
  assert.strictEqual(inserted.jurisdiction, 'ADGM');
});

await testAsync(
  '5.2 queryLeads supports jurisdiction, status, search, and pagination',
  async () => {
    // Jurisdiction filter
    const adgmRes = await queryLeads(seedClient, { jurisdiction: 'ADGM' });
    assert.ok(adgmRes.total >= 1);
    assert.ok(adgmRes.leads.every((l) => l.jurisdiction.includes('ADGM')));

    // Text search
    const searchRes = await queryLeads(seedClient, { search: 'Tariq' });
    assert.ok(searchRes.total >= 1);
    assert.strictEqual(searchRes.leads[0].name, 'Tariq Al-Hashemi');

    // Pagination limit & offset
    const pageRes = await queryLeads(seedClient, { limit: 5, offset: 0 });
    assert.strictEqual(pageRes.leads.length, 5);
    assert.strictEqual(pageRes.limit, 5);
    assert.strictEqual(pageRes.offset, 0);
  }
);

await testAsync('5.3 updateLeadStatus validates status and updates timestamp', async () => {
  // Valid update
  const updated = await updateLeadStatus(seedClient, 'KLAY-MANUAL-001', 'Contacted');
  assert.ok(updated);
  assert.strictEqual(updated.status, 'Contacted');
  assert.ok(updated.updated_at);

  // Invalid update throws error
  let threw = false;
  try {
    await updateLeadStatus(seedClient, 'KLAY-MANUAL-001', 'InvalidStage');
  } catch {
    threw = true;
  }
  assert.strictEqual(threw, true, 'Must reject invalid status');
});

await testAsync('5.4 Blog CRUD: listBlogs, upsertBlog, and deleteBlog', async () => {
  // Upsert new blog
  const newBlog = {
    title: 'DIFC Foundation Vehicles 2026',
    slug: 'difc-foundation-vehicles-2026',
    pillar: 'Family Wealth',
    content: '## Guide\n' + 'word '.repeat(300), // ~2 min reading time
    status: 'published',
    date: '2026-11-15',
  };

  const created = await upsertBlog(seedClient, newBlog);
  assert.ok(created);
  assert.strictEqual(created.slug, 'difc-foundation-vehicles-2026');
  assert.strictEqual(created.reading_time, 2);

  // List blogs
  const blogs = await listBlogs(seedClient);
  assert.ok(blogs.length >= 1);
  assert.ok(blogs.some((b) => b.slug === 'difc-foundation-vehicles-2026'));

  // Upsert update existing blog
  const updatedBlog = {
    ...newBlog,
    title: 'DIFC Foundation Vehicles 2026 (Updated)',
    status: 'draft',
  };
  const updated = await upsertBlog(seedClient, updatedBlog);
  assert.strictEqual(updated.title, 'DIFC Foundation Vehicles 2026 (Updated)');
  assert.strictEqual(updated.status, 'draft');

  // Delete blog
  const deleted = await deleteBlog(seedClient, 'difc-foundation-vehicles-2026');
  assert.strictEqual(deleted, true);

  // Second delete returns false
  const repeatDelete = await deleteBlog(seedClient, 'difc-foundation-vehicles-2026');
  assert.strictEqual(repeatDelete, false);
});

// ============================================================================
// SUITE 6: UNIVERSAL LEAD INTAKE INTEGRATION (lead-intake-core.cjs)
// ============================================================================
console.log('\n--- SUITE 6: Universal Lead Intake Pipeline Integration ---');

await testAsync('6.1 processIntakeLead persists to disk and Turso concurrently', async () => {
  const sampleLead = {
    name: 'Sheikha Latifa',
    email: 'latifa@royal-office.ae',
    phone: '050 999 8877',
    jurisdiction: 'DIFC',
    activity: 'Single Family Office',
    timeline: 'Immediate',
    visaCount: 5,
    notes: 'Require Category 4 DIFC regulated entity structure.',
  };

  const intakeRes = await leadIntakeCore.processIntakeLead(sampleLead, {
    dataDir: testDbDir,
    tursoClient: seedClient,
    platform: 'test-runner',
  });

  assert.strictEqual(intakeRes.statusCode, 201);
  assert.ok(intakeRes.body.success);
  assert.ok(intakeRes.body.leadId.startsWith('KLAY-'));

  // Verify persistence in Turso table
  const queryRes = await seedClient.execute({
    sql: 'SELECT * FROM leads WHERE id = ?',
    args: [intakeRes.body.leadId],
  });
  assert.strictEqual(queryRes.rows.length, 1);
  const storedLead = queryRes.rows[0];
  assert.strictEqual(storedLead.name, 'Sheikha Latifa');
  assert.strictEqual(
    storedLead.phone,
    '971509998877',
    'Must normalize UAE 05... phone number in Turso table'
  );
  assert.strictEqual(storedLead.jurisdiction, 'DIFC');
  assert.strictEqual(storedLead.status, 'New');

  // Verify persistence to disk JSONL
  const jsonlPath = path.join(testDbDir, 'leads.jsonl');
  assert.ok(fs.existsSync(jsonlPath));
  const fileContent = fs.readFileSync(jsonlPath, 'utf8');
  assert.ok(fileContent.includes(intakeRes.body.leadId));
});

await testAsync(
  '6.2 persistLeadToTurso dynamically auto-migrates legacy table lacking budget column',
  async () => {
    // 1. Create dedicated isolated database with legacy schema (NO budget column)
    const legacyDbPath = path.join(testDbDir, 'legacy-leads-test.db');
    const legacyClient = createClient({ url: `file:${legacyDbPath}` });

    await legacyClient.execute(`
      CREATE TABLE leads (
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
        status TEXT NOT NULL DEFAULT 'New',
        created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      );
    `);

    // Verify initial legacy schema state: budget column MUST NOT exist
    const preCheck = await legacyClient.execute('PRAGMA table_info(leads)');
    const preColumnNames = preCheck.rows.map((r) => r.name);
    assert.strictEqual(
      preColumnNames.includes('budget'),
      false,
      'Legacy table must NOT have budget column before auto-migration'
    );

    // 2. Invoke persistLeadToTurso with lead record containing budget qualifier
    const legacyLead = {
      id: 'KLAY-LEGACY-TEST-001',
      referenceNumber: 'KLAY-LEGACY-TEST-001',
      timestamp: new Date().toISOString(),
      name: 'Legacy Migration Sovereign Lead',
      email: 'legacy@sovereign.ae',
      phone: '050 777 6655',
      budget: 'AED 50k - 100k',
      jurisdiction: 'DIFC',
      activity: 'Asset Management',
      timeline: 'Immediate',
      status: 'New',
    };

    const persistResult = await leadIntakeCore.persistLeadToTurso(legacyLead, {
      client: legacyClient,
    });

    // Assert that persistLeadToTurso returned true (auto-migration succeeded and inserted)
    assert.strictEqual(
      persistResult,
      true,
      'persistLeadToTurso must return true upon successful auto-migration on unmigrated table'
    );

    // 3. Assert via PRAGMA table_info(leads) that the budget column was dynamically added
    const postCheck = await legacyClient.execute('PRAGMA table_info(leads)');
    const postColumnNames = postCheck.rows.map((r) => r.name);
    assert.strictEqual(
      postColumnNames.includes('budget'),
      true,
      'PRAGMA table_info(leads) must verify budget column was dynamically added via ALTER TABLE'
    );

    // 4. Assert via SELECT budget FROM leads that data was persisted accurately
    const selectRes = await legacyClient.execute({
      sql: 'SELECT id, name, phone, budget, jurisdiction, status FROM leads WHERE id = ?',
      args: ['KLAY-LEGACY-TEST-001'],
    });

    assert.strictEqual(selectRes.rows.length, 1, 'Persisted lead row must exist');
    const stored = selectRes.rows[0];
    assert.strictEqual(stored.id, 'KLAY-LEGACY-TEST-001');
    assert.strictEqual(stored.name, 'Legacy Migration Sovereign Lead');
    assert.strictEqual(stored.budget, 'AED 50k - 100k', 'budget column must contain exact value');
    assert.strictEqual(stored.phone, '971507776655', 'phone must be normalized');
    assert.strictEqual(stored.status, 'New');

    legacyClient.close();
  }
);

await testAsync(
  '6.3 persistLeadToTurso handles sequential inserts and ON CONFLICT budget retention',
  async () => {
    const legacyDbPath = path.join(testDbDir, 'legacy-leads-test.db');
    const legacyClient = createClient({ url: `file:${legacyDbPath}` });

    // Subsequent lead insertion into the now-migrated table should succeed directly
    const secondLead = {
      id: 'KLAY-LEGACY-TEST-002',
      referenceNumber: 'KLAY-LEGACY-TEST-002',
      timestamp: new Date().toISOString(),
      name: 'Second Lead After Migration',
      email: 'second@sovereign.ae',
      phone: '+971 52 333 4444',
      budget: 'AED 100k+',
      jurisdiction: 'ADGM',
      status: 'New',
    };

    const secondResult = await leadIntakeCore.persistLeadToTurso(secondLead, {
      client: legacyClient,
    });
    assert.strictEqual(secondResult, true, 'Subsequent insert on migrated table must return true');

    const selectSecond = await legacyClient.execute({
      sql: 'SELECT budget FROM leads WHERE id = ?',
      args: ['KLAY-LEGACY-TEST-002'],
    });
    assert.strictEqual(selectSecond.rows[0].budget, 'AED 100k+');

    // ON CONFLICT update preserves budget when updated with null budget
    const updateLead = {
      id: 'KLAY-LEGACY-TEST-002',
      name: 'Second Lead After Migration',
      email: 'second@sovereign.ae',
      phone: '+971 52 333 4444',
      budget: null,
      status: 'Contacted',
    };
    const updateResult = await leadIntakeCore.persistLeadToTurso(updateLead, {
      client: legacyClient,
    });
    assert.strictEqual(updateResult, true);

    const selectUpdated = await legacyClient.execute({
      sql: 'SELECT status, budget FROM leads WHERE id = ?',
      args: ['KLAY-LEGACY-TEST-002'],
    });
    assert.strictEqual(selectUpdated.rows[0].status, 'Contacted');
    assert.strictEqual(
      selectUpdated.rows[0].budget,
      'AED 100k+',
      'COALESCE must preserve existing budget when updating with null'
    );

    legacyClient.close();
  }
);

await testAsync(
  '6.4 processIntakeLead end-to-end persists budget qualifier and returns 201',
  async () => {
    const endToEndLead = {
      name: 'Dr. Aisha Al-Nuaimi',
      email: 'aisha@healthtech.ae',
      phone: '056 444 3322',
      budget: 'AED 25k - 50k',
      jurisdiction: 'Dubai Mainland',
      activity: 'Healthcare Consulting',
      timeline: '1 Month',
      visaCount: 2,
    };

    const res = await leadIntakeCore.processIntakeLead(endToEndLead, {
      dataDir: testDbDir,
      tursoClient: seedClient,
      platform: 'test-runner',
    });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.success);

    // Verify stored lead in database contains budget
    const checkRes = await seedClient.execute({
      sql: 'SELECT budget, phone FROM leads WHERE id = ?',
      args: [res.body.leadId],
    });
    assert.strictEqual(checkRes.rows.length, 1);
    assert.strictEqual(checkRes.rows[0].budget, 'AED 25k - 50k');
    assert.strictEqual(checkRes.rows[0].phone, '971564443322');
  }
);

// ============================================================================
// SUITE 7: TELEGRAM OUTBOUND ALERT PIPELINE
// ============================================================================
console.log('\n--- SUITE 7: Telegram Outbound Alert Pipeline ---');

test('7.1 escapeTelegramHtml escapes reserved HTML entities safely', () => {
  assert.strictEqual(
    leadIntakeCore.escapeTelegramHtml('Tariq <CEO & Founder> "Klay"'),
    'Tariq &lt;CEO &amp; Founder&gt; &quot;Klay&quot;'
  );
  assert.strictEqual(leadIntakeCore.escapeTelegramHtml(null), '');
  assert.strictEqual(leadIntakeCore.escapeTelegramHtml(undefined), '');
  assert.strictEqual(leadIntakeCore.escapeTelegramHtml(0), '0');
});

test('7.2 buildTelegramAlertPayload produces HTML dialer and valid WhatsApp inline keyboard', () => {
  const lead = {
    id: 'KLAY-2026-TEST',
    name: 'Hamdan Al-Maktoum',
    email: 'hamdan@dubai.ae',
    phone: '+971 50 123 4567',
    jurisdiction: 'DIFC',
    activity: 'Artificial Intelligence',
    timeline: 'Immediate',
    visaCount: 10,
    notes: 'Urgent setup required for AI innovation hub license.',
    timestamp: '2026-11-15T12:00:00.000Z',
  };

  const payload = leadIntakeCore.buildTelegramAlertPayload(lead, '123456789');

  assert.strictEqual(payload.chat_id, '123456789');
  assert.strictEqual(payload.parse_mode, 'HTML');
  assert.strictEqual(payload.link_preview_options.is_disabled, true);

  // 1. Prominent Phone Dialer in message body
  assert.ok(
    payload.text.includes('<a href="tel:+971501234567">+971 50 123 4567</a>'),
    'HTML body must contain direct dialer link'
  );

  // 2. WhatsApp Inline Keyboard button
  assert.ok(payload.reply_markup?.inline_keyboard?.length === 1);
  const button = payload.reply_markup.inline_keyboard[0][0];
  assert.strictEqual(button.text, '💬 WhatsApp Lead');
  assert.ok(button.url.startsWith('https://wa.me/971501234567'));
  assert.ok(button.url.includes(encodeURIComponent('Hello Hamdan Al-Maktoum')));

  // 3. Strict Telegram Protocol Compliance: No tel: in button URL
  assert.ok(
    !button.url.startsWith('tel:'),
    'BUTTON_URL_INVALID: inline buttons must never use tel: URI'
  );
});

test('7.3 buildTelegramAlertPayload safely truncates notes to 1000 characters and escapes entities', () => {
  const maliciousLead = {
    id: 'KLAY-2026-XSS',
    name: 'Attacker <script>alert(1)</script>',
    email: 'test@attack.com',
    phone: '0501112233',
    jurisdiction: 'ADGM & DIFC',
    notes: 'A'.repeat(1500) + '<malicious_tag>',
    visaCount: '<invalid>5</invalid>',
  };

  const payload = leadIntakeCore.buildTelegramAlertPayload(maliciousLead, '123456789');

  // Verify entities escaped
  assert.ok(!payload.text.includes('<script>'));
  assert.ok(payload.text.includes('&lt;script&gt;'));
  assert.ok(payload.text.includes('ADGM &amp; DIFC'));
  assert.ok(payload.text.includes('&lt;invalid&gt;5&lt;/invalid&gt;'));

  // Verify notes truncation to 1000 chars
  assert.ok(!payload.text.includes('A'.repeat(1001)));
  assert.ok(!payload.text.includes('<malicious_tag>'));
});

test('7.4 buildTelegramAlertPayload renders plain text phone if phone is empty (no broken tel: link)', () => {
  const leadWithoutPhone = {
    id: 'KLAY-NO-PHONE',
    name: 'Email Only Lead',
    email: 'email@only.com',
    phone: '',
  };

  const payload = leadIntakeCore.buildTelegramAlertPayload(leadWithoutPhone, '123456789');
  assert.ok(!payload.text.includes('<a href="tel:">'));
  assert.ok(payload.text.includes('N/A'));
  assert.strictEqual(payload.reply_markup.inline_keyboard.length, 0);
});

await testAsync(
  '7.5 sendTelegramAlert returns error safely when credentials are missing',
  async () => {
    const prevToken = process.env.TELEGRAM_BOT_TOKEN;
    const prevChat = process.env.TELEGRAM_CHAT_ID;
    try {
      delete process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.TELEGRAM_CHAT_ID;

      const res = await leadIntakeCore.sendTelegramAlert({
        id: 'KLAY-TEST',
        name: 'Test Lead',
        email: 'test@example.com',
        phone: '+971501234567',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'Telegram credentials missing');
    } finally {
      if (prevToken) process.env.TELEGRAM_BOT_TOKEN = prevToken;
      if (prevChat) process.env.TELEGRAM_CHAT_ID = prevChat;
    }
  }
);

// ============================================================================
// SUITE 8: ADMIN CORE HANDLERS TURSO INTEGRATION
// ============================================================================
console.log('\n--- SUITE 8: Admin Core Handlers Turso Integration ---');

await testAsync('8.1 handleGetLeads with Turso client returns leads with pagination', async () => {
  const res = await adminCore.handleGetLeads(
    { limit: 10, offset: 0 },
    { client: seedClient, useTurso: true }
  );
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.total >= 159, 'Must reflect 159 historical leads plus inserted test records');
  assert.strictEqual(res.body.leads.length, 10);
});

await testAsync(
  '8.2 handlePatchLead with Turso client updates status in Turso database',
  async () => {
    const res = await adminCore.handlePatchLead(
      'KLAY-MANUAL-001',
      { status: 'Proposal Sent' },
      { client: seedClient, useTurso: true }
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.lead.status, 'Proposal Sent');

    // Verify in database
    const leadRes = await seedClient.execute({
      sql: 'SELECT status FROM leads WHERE id = ?',
      args: ['KLAY-MANUAL-001'],
    });
    assert.strictEqual(leadRes.rows[0].status, 'Proposal Sent');
  }
);

await testAsync(
  '8.3 handlePostBlog, handleGetBlogs, and handleDeleteBlog with Turso client',
  async () => {
    const blog = {
      title: 'UAE Corporate Governance 2026',
      slug: 'uae-corporate-governance-2026',
      pillar: 'Corporate Structuring',
      content: 'Executive briefing on board composition and audit committees in UAE.',
      status: 'published',
    };

    // POST
    const postRes = await adminCore.handlePostBlog(blog, { client: seedClient, useTurso: true });
    assert.ok(postRes.statusCode === 200 || postRes.statusCode === 201);
    assert.strictEqual(postRes.body.ok, true);
    assert.strictEqual(postRes.body.blog.slug, 'uae-corporate-governance-2026');

    // GET
    const getRes = await adminCore.handleGetBlogs({ client: seedClient, useTurso: true });
    assert.strictEqual(getRes.statusCode, 200);
    assert.ok(getRes.body.blogs.some((b) => b.slug === 'uae-corporate-governance-2026'));

    // DELETE
    const deleteRes = await adminCore.handleDeleteBlog('uae-corporate-governance-2026', {
      client: seedClient,
      useTurso: true,
    });
    assert.strictEqual(deleteRes.statusCode, 200);
    assert.strictEqual(deleteRes.body.ok, true);
    assert.strictEqual(deleteRes.body.deleted, 'uae-corporate-governance-2026');
  }
);

await testAsync(
  '8.4 handleAdminLogin verifies credentials against Turso admin_users table',
  async () => {
    const loginRes = await adminCore.handleAdminLogin(
      { username: 'admin', password: 'KlayAdmin2026!Dev' },
      '127.0.0.1',
      { client: seedClient }
    );
    assert.strictEqual(loginRes.statusCode, 200);
    assert.strictEqual(loginRes.body.ok, true);
    assert.strictEqual(loginRes.body.user.username, 'admin');
    assert.ok(loginRes.body.token);
    assert.ok(loginRes.headers['Set-Cookie'].includes('klay_admin_session='));
  }
);

// Cleanup test database directory
try {
  fs.rmSync(testDbDir, { recursive: true, force: true });
} catch {
  // Non-fatal
}

console.log('\n======================================================================');
console.log(`TOTAL TESTS:  ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error('❌ SOME TURSO & TELEGRAM TESTS FAILED!');
  process.exit(1);
} else {
  console.log('🎉 ALL TURSO DATABASE & TELEGRAM TELEMETRY TESTS PASSED CLEANLY! 🎉\n');
}
