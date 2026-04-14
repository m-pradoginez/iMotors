import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { query, closePool, testConnection } from './connection';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'NOT SET');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

interface Migration {
  version: string;
  filename: string;
  sql: string;
}

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await query('SELECT version FROM schema_migrations ORDER BY version');
    return result.rows.map(row => row.version);
  } catch {
    // schema_migrations table might not exist yet (first migration will create it)
    return [];
  }
}

async function applyMigration(migration: Migration): Promise<void> {
  console.log(`Applying migration: ${migration.version}`);

  await query('BEGIN');
  try {
    await query(migration.sql);
    await query('INSERT INTO schema_migrations (version) VALUES ($1)', [migration.version]);
    await query('COMMIT');
    console.log(`  ✓ Applied ${migration.version}`);
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

function loadMigrations(): Migration[] {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files.map(filename => ({
    version: filename.replace('.sql', ''),
    filename,
    sql: fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf-8'),
  }));
}

async function main(): Promise<void> {
  console.log('Running database migrations...\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  const migrations = loadMigrations();
  const applied = await getAppliedMigrations();

  const pending = migrations.filter(m => !applied.includes(m.version));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    await closePool();
    return;
  }

  console.log(`Found ${pending.length} pending migration(s):\n`);

  for (const migration of pending) {
    await applyMigration(migration);
  }

  console.log('\n✓ All migrations applied successfully');
  await closePool();
}

main().catch(err => {
  console.error('Migration failed:', err);
  closePool().then(() => process.exit(1));
});
