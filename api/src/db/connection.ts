import * as dotenv from 'dotenv';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: true } // Hardened for security
    : false,
});

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
