/**
 * Turso Database Cloud Migration Script (`scripts/migrate-turso-schema.mjs`)
 *
 * Safely and idempotently adds `budget TEXT` to the `leads` table in Turso Cloud.
 * Supports:
 *   --check     Inspects table columns without altering
 *   --up        Applies forward migration (default)
 *   --rollback  Reverts migration (drops column)
 *   --verify    Runs insert/read/delete probe verifying roundtrip persistence
 */

import { createClient } from '@libsql/client';

export const LIVE_TURSO_URL = 'libsql://klay-db-klayconsultant.aws-eu-central-1.turso.io';
export const LIVE_TURSO_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ4MjMyMDYsImlkIjoiMDFhMWUzY2MtOTYwMS03NmRmLWI3ZmQtYWI5ZjJiMzlkZGNhIiwia2lkIjoieVdMUFZUdmU4MXVJakVaUEVDTWdFUzZOcTdvTjV6cVZYeXZJWk5kcnEzZyIsInJpZCI6IjhhMDkwZTQxLTcxN2MtNGMyMC05NDdiLTVmNmE1MWUwOTYxNyJ9.7iakZdSFmOzxjBbh73PM514YJB0WfVuVAIfems3VreNPyX4J7mCJkGH3iwdYAyS3BFz7p7D1O1eqDzEBV8ksBg';

const url = process.env.TURSO_DATABASE_URL || LIVE_TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || LIVE_TURSO_TOKEN;

export function getClient(customConfig = {}) {
  const targetUrl = customConfig.url || url;
  const targetToken =
    customConfig.authToken || (targetUrl.startsWith('libsql:') ? authToken : undefined);
  return createClient({ url: targetUrl, authToken: targetToken });
}

export async function getLeadsColumns(client = getClient()) {
  const res = await client.execute('PRAGMA table_info(leads)');
  return res.rows.map((r) => r.name);
}

export async function migrateUp(client = getClient()) {
  console.log(`Connecting to Turso: ${url}`);
  const columns = await getLeadsColumns(client);
  if (columns.includes('budget')) {
    console.log('✅ Idempotency check: Column "budget" already exists in "leads" table.');
    return { altered: false, exists: true };
  }

  console.log('Applying forward migration: ALTER TABLE leads ADD COLUMN budget TEXT;');
  await client.execute('ALTER TABLE leads ADD COLUMN budget TEXT;');
  const updatedCols = await getLeadsColumns(client);
  if (updatedCols.includes('budget')) {
    console.log('🎉 Successfully added "budget TEXT" to "leads" table!');
    return { altered: true, exists: true };
  }
  throw new Error('Migration verification failed: column not found after ALTER TABLE');
}

export async function migrateDown(client = getClient()) {
  console.log(`Connecting to Turso: ${url}`);
  const columns = await getLeadsColumns(client);
  if (!columns.includes('budget')) {
    console.log('✅ Idempotency check: Column "budget" is not present in "leads" table.');
    return { dropped: false };
  }

  console.log('Applying rollback migration: ALTER TABLE leads DROP COLUMN budget;');
  await client.execute('ALTER TABLE leads DROP COLUMN budget;');
  const updatedCols = await getLeadsColumns(client);
  if (!updatedCols.includes('budget')) {
    console.log('🎉 Successfully rolled back "budget" column from "leads" table!');
    return { dropped: true };
  }
  throw new Error('Rollback verification failed: column still present after DROP COLUMN');
}

export async function verifyPipeline(client = getClient()) {
  const testId = `probe-verify-${Date.now()}`;
  console.log(`Executing roundtrip persistence verification with test record: ${testId}`);

  await client.execute({
    sql: `INSERT INTO leads (
      id, reference_number, timestamp, name, email, phone, budget,
      jurisdiction, activity, timeline, visa_count, notes,
      source, platform, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      testId,
      testId,
      new Date().toISOString(),
      'Probe Lead',
      'probe@klay.ae',
      '+971501234567',
      '< AED 25k',
      'UAE',
      'General',
      null,
      null,
      null,
      'calculator',
      'node',
      'New',
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });

  const check = await client.execute({
    sql: 'SELECT id, budget FROM leads WHERE id = ?',
    args: [testId],
  });

  if (check.rows[0]?.budget !== '< AED 25k') {
    throw new Error(
      `Probe verification failed: expected '< AED 25k', got '${check.rows[0]?.budget}'`
    );
  }

  // Clean up probe record
  await client.execute({ sql: 'DELETE FROM leads WHERE id = ?', args: [testId] });
  console.log('✅ Roundtrip persistence verified cleanly.');
}

async function main() {
  const args = process.argv.slice(2);
  const client = getClient();
  if (args.includes('--check')) {
    const cols = await getLeadsColumns(client);
    console.log('Current columns in "leads":', cols);
  } else if (args.includes('--rollback') || args.includes('--down')) {
    await migrateDown(client);
  } else {
    await migrateUp(client);
    if (args.includes('--verify')) {
      await verifyPipeline(client);
    }
  }
}

if (process.argv[1]?.endsWith('migrate-turso-schema.mjs')) {
  main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
