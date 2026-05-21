import { pool } from "../config/db.js";

export const getAllSekolah = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sekolah ORDER BY nama_sekolah");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSekolahById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM sekolah WHERE id_sekolah = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSekolah = async (req, res) => {
  try {
    const { nama_sekolah, alamat } = req.body;
    if (!nama_sekolah) {
      return res.status(400).json({ message: "Nama sekolah wajib diisi" });
    }
    const result = await pool.query(
      "INSERT INTO sekolah (nama_sekolah, alamat) VALUES ($1, $2) RETURNING *",
      [nama_sekolah, alamat]
    );
    res.json({ message: "Sekolah berhasil ditambahkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSekolah = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_sekolah, alamat } = req.body;
    const result = await pool.query(
      "UPDATE sekolah SET nama_sekolah = $1, alamat = $2 WHERE id_sekolah = $3 RETURNING *",
      [nama_sekolah, alamat, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan" });
    }
    res.json({ message: "Sekolah berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSekolah = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM sekolah WHERE id_sekolah = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan" });
    }
    res.json({ message: "Sekolah berhasil dihapus" });
  } catch (err) {
    // Check for foreign key violation
    if (err.code === "23503") {
      return res.status(400).json({ 
        message: "Tidak dapat menghapus sekolah karena masih memiliki data (user atau barang) yang terkait." 
      });
    }
    res.status(500).json({ error: err.message });
  }
};
