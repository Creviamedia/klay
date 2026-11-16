/**
 * scripts/test-challenger-stress-turso.mjs
 *
 * EMPIRICAL ADVERSARIAL STRESS TEST HARNESS FOR SPRINT 2 REMEDIATION
 *
 * Focus:
 * 1. Schema drift test: persistLeadToTurso dynamically alters table lacking 'budget'.
 * 2. Concurrency race conditions:
 *    - Real concurrent burst of multiple simultaneous invocations on unmigrated table.
 *    - Simulated concurrent ALTER TABLE race emitting 'duplicate column name: budget'.
 *    - Simulated concurrent ALTER TABLE race emitting 'already exists'.
 * 3. Unbounded recursion prevention:
 *    - Read-only / locked database permanent failure during ALTER TABLE.
 *    - Persistent missing column simulation (verifying max call depth <= 2).
 *    - Unrelated SQLite constraint failure (immediate termination).
 * 4. Data integrity & ON CONFLICT budget retention:
 *    - COALESCE budget retention on upsert with null budget.
 *    - Budget replacement on upsert with new non-null budget.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import leadIntakeCore from '../netlify/functions/lead-intake-core.cjs';

const { persistLeadToTurso } = leadIntakeCore;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function report(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

async function createLegacyTestDb(label) {
  const tmpDir = path.join(
    '/tmp',
    `klay-challenger-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
  fs.mkdirSync(tmpDir, { recursive: true });
  const dbPath = path.join(tmpDir, 'test.db');
  const client = createClient({ url: `file:${dbPath}` });

  // DDL matching legacy pre-Sprint-2 schema: NO budget column!
  await client.execute(`
    CREATE TABLE leads (
      id TEXT PRIMARY KEY,
      reference_number TEXT,
      timestamp TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      jurisdiction TEXT NOT NULL DEFAULT 'UAE',
      activity TEXT NOT NULL DEFAULT 'General',
      timeline TEXT,
      visa_count INTEGER DEFAULT 0,
      notes TEXT,
      source TEXT,
      platform TEXT,
      status TEXT NOT NULL DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return { client, tmpDir, dbPath };
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('⚡ EMPIRICAL CHALLENGER: TURSO RESILIENCE & CONCURRENCY HARNESS ⚡');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // SUITE 1: Schema Drift & Dynamic ALTER TABLE Execution
  // -------------------------------------------------------------------------
  console.log('--- SUITE 1: Schema Drift & Dynamic ALTER TABLE ---');
  {
    const { client } = await createLegacyTestDb('drift-basic');

    // Confirm budget column is absent initially
    const initialColumns = (await client.execute('PRAGMA table_info(leads)')).rows.map(
      (r) => r.name
    );
    assert.strictEqual(
      initialColumns.includes('budget'),
      false,
      'Legacy table must lack budget column initially'
    );

    const leadRecord = {
      id: 'CHALLENGER-DRIFT-001',
      referenceNumber: 'KLAY-2026-CH001',
      name: 'Adversarial Lead 1',
      email: 'challenger1@example.com',
      phone: '+971501112233',
      budget: 'AED 50k - 100k',
      jurisdiction: 'Mainland DED',
      activity: 'AI Consulting',
      status: 'New',
    };

    const res = await persistLeadToTurso(leadRecord, { client });
    report('1.1 persistLeadToTurso returns true on table lacking budget column', res === true);

    // Verify column was added dynamically
    const postColumns = (await client.execute('PRAGMA table_info(leads)')).rows.map((r) => r.name);
    report('1.2 Dynamic ALTER TABLE added budget column', postColumns.includes('budget'));

    // Verify row was persisted with exact budget
    const row = (
      await client.execute({
        sql: 'SELECT * FROM leads WHERE id = ?',
        args: ['CHALLENGER-DRIFT-001'],
      })
    ).rows[0];
    report(
      '1.3 Lead record has correct budget persisted',
      row && row.budget === 'AED 50k - 100k' && row.name === 'Adversarial Lead 1'
    );
  }

  // -------------------------------------------------------------------------
  // SUITE 2: Concurrency Race Conditions
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Concurrency Race Conditions ---');

  // 2.1: Real simultaneous parallel burst on unmigrated table
  {
    const { client } = await createLegacyTestDb('burst-race');
    const burstCount = 10;
    const leads = Array.from({ length: burstCount }, (_, i) => ({
      id: `CHALLENGER-BURST-${i + 1}`,
      referenceNumber: `REF-BURST-${i + 1}`,
      name: `Burst Lead ${i + 1}`,
      email: `burst${i + 1}@example.com`,
      phone: `+97150999000${i}`,
      budget: i % 2 === 0 ? 'AED 25k - 50k' : 'AED 100k+',
      jurisdiction: 'Free Zone',
      activity: 'Trading',
      status: 'New',
    }));

    // Fire all concurrently
    const results = await Promise.all(leads.map((lead) => persistLeadToTurso(lead, { client })));

    const allSucceeded = results.every((r) => r === true);
    report(
      `2.1 Real concurrent burst (${burstCount} parallel invocations) all return true`,
      allSucceeded
    );

    // Verify all rows exist in the table without data loss
    const countRes = await client.execute('SELECT COUNT(*) as cnt FROM leads');
    const savedCount = Number(countRes.rows[0].cnt);
    report(
      `2.2 All ${burstCount} parallel leads persisted with zero data loss`,
      savedCount === burstCount
    );

    // Verify budget preserved for all
    const rows = (await client.execute('SELECT id, budget FROM leads ORDER BY id ASC')).rows;
    const allBudgetsCorrect = rows.every((r) => {
      const idx = parseInt(r.id.replace('CHALLENGER-BURST-', ''), 10) - 1;
      const expectedBudget = idx % 2 === 0 ? 'AED 25k - 50k' : 'AED 100k+';
      return r.budget === expectedBudget;
    });
    report('2.3 All parallel leads have verified budget integrity', allBudgetsCorrect);
  }

  // 2.2: Intercepted simulated duplicate column name error during ALTER TABLE
  {
    const { client } = await createLegacyTestDb('mock-dup-column');
    let alterTableAttempted = false;
    let duplicateErrorThrown = false;

    // Wrap execute to simulate losing the ALTER TABLE race
    const originalExecute = client.execute.bind(client);
    const interceptingClient = {
      execute: async (stmt) => {
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (/ALTER TABLE leads ADD COLUMN budget/i.test(sql)) {
          alterTableAttempted = true;
          // Apply ALTER to the actual DB first so column exists
          await originalExecute('ALTER TABLE leads ADD COLUMN budget TEXT;');
          // But throw duplicate column name as if another thread won the race
          duplicateErrorThrown = true;
          throw new Error('SQLITE_ERROR: duplicate column name: budget');
        }
        return originalExecute(stmt);
      },
    };

    const leadRecord = {
      id: 'CHALLENGER-RACE-DUP',
      referenceNumber: 'REF-DUP-01',
      name: 'Simulated Race Duplicate Lead',
      email: 'race-dup@example.com',
      phone: '+971505556677',
      budget: '< AED 25k',
      jurisdiction: 'Offshore',
      activity: 'Holding',
      status: 'New',
    };

    const res = await persistLeadToTurso(leadRecord, { client: interceptingClient });
    report('2.4 Handles "duplicate column name: budget" and returns true', res === true);
    report(
      '2.5 Intercepted ALTER TABLE was exercised',
      alterTableAttempted && duplicateErrorThrown
    );

    // Verify lead was stored despite the duplicate column error on ALTER
    const saved = (
      await originalExecute({
        sql: 'SELECT * FROM leads WHERE id = ?',
        args: ['CHALLENGER-RACE-DUP'],
      })
    ).rows[0];
    report(
      '2.6 Lead was persisted following duplicate column retry',
      saved && saved.budget === '< AED 25k'
    );
  }

  // 2.3: Intercepted simulated "already exists" error during ALTER TABLE
  {
    const { client } = await createLegacyTestDb('mock-already-exists');
    const originalExecute = client.execute.bind(client);
    const interceptingClient = {
      execute: async (stmt) => {
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (/ALTER TABLE leads ADD COLUMN budget/i.test(sql)) {
          await originalExecute('ALTER TABLE leads ADD COLUMN budget TEXT;');
          throw new Error('SQLite error: column budget already exists');
        }
        return originalExecute(stmt);
      },
    };

    const leadRecord = {
      id: 'CHALLENGER-RACE-EXISTS',
      referenceNumber: 'REF-EXISTS-01',
      name: 'Simulated Already Exists Lead',
      email: 'already-exists@example.com',
      phone: '+971507778899',
      budget: 'AED 100k+',
      status: 'New',
    };

    const res = await persistLeadToTurso(leadRecord, { client: interceptingClient });
    report('2.7 Handles "column already exists" error and returns true', res === true);

    const saved = (
      await originalExecute({
        sql: 'SELECT * FROM leads WHERE id = ?',
        args: ['CHALLENGER-RACE-EXISTS'],
      })
    ).rows[0];
    report(
      '2.8 Lead was persisted following already-exists retry',
      saved && saved.budget === 'AED 100k+'
    );
  }

  // -------------------------------------------------------------------------
  // SUITE 3: Unbounded Recursion Prevention & Error Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Unbounded Recursion Prevention & Isolation ---');

  // 3.1: Permanent migration failure (Read-only / Locked database)
  {
    const { client } = await createLegacyTestDb('readonly-fail');
    const originalExecute = client.execute.bind(client);
    let alterAttempts = 0;

    const lockedClient = {
      execute: async (stmt) => {
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (/ALTER TABLE leads ADD COLUMN budget/i.test(sql)) {
          alterAttempts++;
          throw new Error('SQLITE_READONLY: attempt to write a readonly database');
        }
        return originalExecute(stmt);
      },
    };

    const leadRecord = {
      id: 'CHALLENGER-READONLY',
      name: 'Readonly Fail Lead',
      email: 'fail@example.com',
      phone: '+971500000001',
      budget: 'AED 25k - 50k',
    };

    const startTime = Date.now();
    const res = await persistLeadToTurso(leadRecord, { client: lockedClient });
    const elapsed = Date.now() - startTime;

    report('3.1 Readonly failure terminates cleanly without throwing', res === false);
    report('3.2 Readonly failure bounds ALTER TABLE attempts to exactly 1', alterAttempts === 1);
    report(
      '3.3 Readonly failure finishes rapidly (< 1000ms) without infinite looping',
      elapsed < 1000
    );
  }

  // 3.2: Persistent missing column error (simulating view/trigger that permanently throws)
  {
    let callCount = 0;
    const alwaysFailingClient = {
      execute: async (stmt) => {
        callCount++;
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (/ALTER TABLE/i.test(sql)) {
          // ALTER TABLE supposedly "succeeds"
          return { rows: [] };
        }
        // But INSERT always fails with missing column
        throw new Error('SQLITE_ERROR: table leads has no column named budget');
      },
    };

    const leadRecord = {
      id: 'CHALLENGER-PERM-FAIL',
      name: 'Permanent Fail Lead',
      email: 'perm@example.com',
      phone: '+971500000002',
      budget: 'AED 25k - 50k',
    };

    const res = await persistLeadToTurso(leadRecord, { client: alwaysFailingClient });

    // Call 1: INSERT (fails) -> ALTER TABLE (succeeds) -> Call 2 (retry): INSERT (fails) -> terminates!
    // Total executes: INSERT (1) + ALTER (1) + retry INSERT (1) = 3 executes
    report('3.4 Persistent missing column returns false gracefully', res === false);
    report(
      '3.5 Bounded recursion stops after exactly 1 retry (call count <= 3 executes)',
      callCount <= 3
    );
  }

  // 3.3: Unrelated SQLite error does not trigger auto-migration or retry
  {
    let alterTriggered = false;
    let insertCount = 0;
    const constraintFailingClient = {
      execute: async (stmt) => {
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (/ALTER TABLE/i.test(sql)) {
          alterTriggered = true;
          return { rows: [] };
        }
        insertCount++;
        throw new Error('SQLITE_CONSTRAINT: CHECK constraint failed: leads_status');
      },
    };

    const leadRecord = {
      id: 'CHALLENGER-CONSTRAINT-FAIL',
      name: 'Constraint Fail Lead',
      email: 'chk@example.com',
      phone: '+971500000003',
      budget: 'AED 50k - 100k',
    };

    const res = await persistLeadToTurso(leadRecord, { client: constraintFailingClient });
    report(
      '3.6 Unrelated error returns false immediately without retry',
      res === false && insertCount === 1
    );
    report('3.7 Unrelated error does NOT execute ALTER TABLE', alterTriggered === false);
  }

  // -------------------------------------------------------------------------
  // SUITE 4: ON CONFLICT Upsert & Budget Retention
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 4: ON CONFLICT Upsert & Budget Retention ---');
  {
    const { client } = await createLegacyTestDb('upsert-test');

    // Step 1: Insert initial lead with budget
    const initialLead = {
      id: 'CHALLENGER-UPSERT-001',
      referenceNumber: 'REF-UP-01',
      name: 'Initial Upsert Lead',
      email: 'upsert@example.com',
      phone: '+971501230000',
      budget: 'AED 50k - 100k',
      status: 'New',
    };
    const res1 = await persistLeadToTurso(initialLead, { client });
    report('4.1 Initial lead insert via auto-migration succeeds', res1 === true);

    // Step 2: Upsert lead with budget = null (e.g. status update or webhook without budget)
    const updateLeadWithNullBudget = {
      id: 'CHALLENGER-UPSERT-001',
      name: 'Updated Lead Name',
      email: 'upsert@example.com',
      phone: '+971501230000',
      budget: null,
      status: 'Qualified',
    };
    const res2 = await persistLeadToTurso(updateLeadWithNullBudget, { client });
    report('4.2 Upsert with null budget succeeds', res2 === true);

    // Verify existing budget was retained via COALESCE
    const rowAfterNull = (
      await client.execute({
        sql: 'SELECT status, budget, name FROM leads WHERE id = ?',
        args: ['CHALLENGER-UPSERT-001'],
      })
    ).rows[0];
    report(
      '4.3 COALESCE retains existing budget when update has null budget',
      rowAfterNull.budget === 'AED 50k - 100k' && rowAfterNull.status === 'Qualified'
    );

    // Step 3: Upsert lead with new budget value
    const updateLeadWithNewBudget = {
      id: 'CHALLENGER-UPSERT-001',
      name: 'Updated Lead Name',
      email: 'upsert@example.com',
      phone: '+971501230000',
      budget: 'AED 100k+',
      status: 'Won',
    };
    const res3 = await persistLeadToTurso(updateLeadWithNewBudget, { client });
    report('4.4 Upsert with new budget succeeds', res3 === true);

    const rowAfterUpdate = (
      await client.execute({
        sql: 'SELECT status, budget FROM leads WHERE id = ?',
        args: ['CHALLENGER-UPSERT-001'],
      })
    ).rows[0];
    report(
      '4.5 New budget replaces existing budget when provided',
      rowAfterUpdate.budget === 'AED 100k+' && rowAfterUpdate.status === 'Won'
    );
  }

  // -------------------------------------------------------------------------
  // Summary & Verdict
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TOTAL ADVERSARIAL STRESS TESTS: ${totalTests}`);
  console.log(`PASSED                        : ${passedTests}`);
  console.log(`FAILED                        : ${failedTests}`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    console.error(`❌ EMPIRICAL CHALLENGE FAILED: ${failedTests} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('🏆 VERDICT: CONFIRMED');
    console.log(
      'All empirical stress tests, concurrency race simulations, and bounded recursion checks PASSED cleanly!'
    );
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled harness exception:', err);
  process.exit(1);
});
