import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkPetugas() {
  try {
    const res = await pool.query(
      "SELECT * FROM users WHERE role = 'petugas' LIMIT 1"
    );
    console.log("Petugas Row:");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkPetugas();
