import { Pool } from 'pg';

let pool: Pool | null = null;

export const getDb = (): Pool | null => {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
};
