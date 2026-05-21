import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkSchema() {
  try {
    const peminjamanRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'peminjaman'"
    );
    const detailRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'detail_peminjaman'"
    );
    
    const output = {
      peminjaman: peminjamanRes.rows.map(r => r.column_name),
      detail_peminjaman: detailRes.rows.map(r => r.column_name)
    };
    
    fs.writeFileSync("schema_output.json", JSON.stringify(output, null, 2));
    console.log("Schema written to schema_output.json");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
