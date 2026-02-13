import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

const client = await pool.connect()
const res = await client.query('SELECT 1 as ok')
console.log(res.rows)
client.release()
await pool.end()
