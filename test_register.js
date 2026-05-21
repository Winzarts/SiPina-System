import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testRegister() {
  try {
    const email = `test_${Date.now()}@example.com`;
    const username = `test_user_${Date.now()}`;
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Attempting to register: ${email}, ${username}`);
    
    // Using exactly the same query as in the controller
    const res = await pool.query(
      "INSERT INTO users (email, username, passwords, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, username, hashedPassword, "admin"]
    );
    
    console.log("Registration successful! ID:", res.rows[0].id);
  } catch (err) {
    console.error("Registration FAILED:");
    console.error(err);
  } finally {
    await pool.end();
  }
}

testRegister();
