import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    // Check vehicles columns
    const cols = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='vehicles' ORDER BY ordinal_position`
    );
    console.log('=== vehicles columns ===');
    console.log(cols.rows.map((r: any) => r.column_name).join(', '));

    // Check row counts
    const count = await pool.query(`SELECT COUNT(*) FROM vehicles WHERE price IS NOT NULL AND city_km_l IS NOT NULL`);
    console.log('\n=== rows with price + fuel efficiency ===');
    console.log(count.rows[0].count);

    // Sample rows
    const sample = await pool.query(
      `SELECT fipe_code, brand, model, year, fuel_type, category, price, city_km_l, highway_km_l, efficiency_rating FROM vehicles WHERE price IS NOT NULL AND city_km_l IS NOT NULL LIMIT 3`
    );
    console.log('\n=== sample rows ===');
    console.log(JSON.stringify(sample.rows, null, 2));
  } catch (e: any) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
}

main();
