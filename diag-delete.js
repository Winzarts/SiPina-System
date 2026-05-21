import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testDelete() {
  try {
    // 1. List some barang to get an ID
    const res = await pool.query(
      "SELECT id_barang, nama_barang FROM barang LIMIT 5",
    );
    console.log("Existing barang:", res.rows);

    if (res.rows.length === 0) {
      console.log("No barang found to test delete.");
      return;
    }

    const testId = res.rows[0].id_barang;
    console.log(`Testing delete for id_barang: ${testId}`);

    // 2. Try to delete
    try {
      const deleteRes = await pool.query(
        "DELETE FROM barang WHERE id_barang=$1",
        [testId],
      );
      console.log(
        "Delete result:",
        deleteRes.rowCount === 0 ? "Not found" : "Deleted successfully",
      );
    } catch (err) {
      console.error("Delete failed with error:", err.message);
      if (err.code === "23503") {
        console.log("This is a foreign key constraint violation.");
        // Check what references it
        const refRes = await pool.query(
          "SELECT * FROM detail_peminjaman WHERE barang_id=$1",
          [testId],
        );
        console.log(
          `Found ${refRes.rows.length} references in detail_peminjaman.`,
        );
      }
    }
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool.end();
  }
}

testDelete();
