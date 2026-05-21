import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../util/email.js";

// Helper to generate a 6-digit OTP code
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendRegisterOtp = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "Email dan Username wajib diisi" });
    }

    // Check if user already exists
    const checkUser = await pool.query(
      "SELECT id_users FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email atau Username sudah terdaftar" });
    }

    // Generate OTP and expiration (10 minutes)
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to DB
    await pool.query(
      "INSERT INTO otps (email, otp_code, otp_type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otpCode, "register", expiresAt]
    );

    // Send Email (or log in console as debug fallback)
    await sendOtpEmail(email, otpCode, "register");

    res.json({ message: "OTP pendaftaran berhasil dikirim ke email Anda" });
  } catch (err) {
    console.error("Send Register OTP error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { email, username, password, nama_sekolah, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "Kode OTP wajib dimasukkan" });
    }

    // Verify OTP code
    const otpResult = await pool.query(
      "SELECT id FROM otps WHERE email = $1 AND otp_code = $2 AND otp_type = $3 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp, "register"]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "Kode OTP tidak valid atau telah kedaluwarsa" });
    }

    // Hash the password for safety
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get or create sekolah_id based on nama_sekolah
    let sekolah_id;
    const schoolResult = await pool.query(
      "SELECT id_sekolah FROM sekolah WHERE nama_sekolah = $1",
      [nama_sekolah]
    );

    if (schoolResult.rows.length > 0) {
      sekolah_id = schoolResult.rows[0].id_sekolah;
    } else {
      const newSchool = await pool.query(
        "INSERT INTO sekolah (nama_sekolah) VALUES ($1) RETURNING id_sekolah",
        [nama_sekolah]
      );
      sekolah_id = newSchool.rows[0].id_sekolah;
    }

    // Insert user (removed address 'alamat' entirely to match DB structure)
    await pool.query(
      "INSERT INTO users (email, username, passwords, role, sekolah_id) VALUES ($1, $2, $3, $4, $5)",
      [email, username, hashedPassword, "admin", sekolah_id]
    );

    // Delete used OTP
    await pool.query("DELETE FROM otps WHERE email = $1 AND otp_type = $2", [
      email,
      "register",
    ]);

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    // Check if email exists
    const userResult = await pool.query(
      "SELECT id_users FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Email tidak terdaftar di sistem" });
    }

    // Generate OTP and expiration (10 minutes)
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to DB
    await pool.query(
      "INSERT INTO otps (email, otp_code, otp_type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otpCode, "reset_password", expiresAt]
    );

    // Send Email
    await sendOtpEmail(email, otpCode, "reset_password");

    res.json({ message: "OTP reset password berhasil dikirim ke email Anda" });
  } catch (err) {
    console.error("Send Reset OTP error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!otp || !newPassword || !email) {
      return res.status(400).json({ message: "Data reset tidak lengkap" });
    }

    // Verify OTP code
    const otpResult = await pool.query(
      "SELECT id FROM otps WHERE email = $1 AND otp_code = $2 AND otp_type = $3 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp, "reset_password"]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "Kode OTP tidak valid atau telah kedaluwarsa" });
    }

    // Hash the new password for security
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await pool.query(
      "UPDATE users SET passwords = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    // Delete used OTP
    await pool.query("DELETE FROM otps WHERE email = $1 AND otp_type = $2", [
      email,
      "reset_password",
    ]);

    res.json({ message: "Password berhasil diperbarui" });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createPetugas = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Removed alamat completely
    await pool.query(
      "INSERT INTO users (email, username, passwords, role, created_by, sekolah_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        email,
        username,
        hashedPassword,
        "petugas",
        req.user.id_users || req.user.id,
        req.user.sekolah_id,
      ]
    );

    res.json({ message: "Petugas created successfully" });
  } catch (err) {
    console.error("Create petugas error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let result;

    if (email) {
      result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
    } else if (username) {
      result = await pool.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
    } else {
      return res.status(400).json({ message: "Data login tidak lengkap" });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Akun tidak ditemukan" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.passwords);
    if (!validPassword) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id_users: user.id_users,
        id: user.id_users,
        role: user.role,
        sekolah_id: user.sekolah_id,
      },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_users AS id, u.username, u.email, u.role, u.sekolah_id, s.nama_sekolah 
       FROM users u
       LEFT JOIN sekolah s ON u.sekolah_id = s.id_sekolah
       WHERE u.id_users = $1`,
      [req.user.id_users || req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getListPetugas = async (req, res) => {
  try {
    // Removed alamat from SELECT query
    const result = await pool.query(
      `SELECT id_users AS id, username, email, role, create_at AS created_at
       FROM users
       WHERE role = 'petugas' AND sekolah_id = $1
       ORDER BY create_at DESC`,
      [req.user.sekolah_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
