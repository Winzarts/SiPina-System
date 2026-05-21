import { pool } from "../config/db.js";

export const getAllKelas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM kelas WHERE sekolah_id = $1 ORDER BY nama_kelas", [req.user.sekolah_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createKelas = async (req, res) => {
  try {
    const { nama_kelas } = req.body;

    if (!nama_kelas) {
      return res.status(400).json({ message: "Nama kelas wajib diisi" });
    }

    await pool.query("INSERT INTO kelas (nama_kelas, sekolah_id) VALUES ($1, $2)", [
      nama_kelas,
      req.user.sekolah_id,
    ]);

    res.json({ message: "Kelas berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateKelas = async (req, res) => {
  try {
    const { id_kelas } = req.params;
    const { nama_kelas } = req.body;

    await pool.query("UPDATE kelas SET nama_kelas=$1 WHERE id_kelas=$2 AND sekolah_id=$3", [
      nama_kelas,
      id_kelas,
      req.user.sekolah_id,
    ]);

    res.json({ message: "Kelas berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const { id_kelas } = req.params;

    await pool.query("DELETE FROM kelas WHERE id_kelas=$1 AND sekolah_id=$2", [id_kelas, req.user.sekolah_id]);

    res.json({ message: "Kelas berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
