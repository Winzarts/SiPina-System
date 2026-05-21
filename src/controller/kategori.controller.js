import { pool } from "../config/db.js";

export const getAllKategori = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM kategori_barang WHERE sekolah_id = $1", [req.user.sekolah_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createKategori = async (req, res) => {
  try {
    const { nama_kategori, nama } = req.body;
    const final_nama = nama_kategori || nama;

    if (!final_nama) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await pool.query(
      `INSERT INTO kategori_barang
      (nama_kategori, sekolah_id) 
      VALUES ($1, $2)`,
      [final_nama, req.user.sekolah_id],
    );

    res.json({ message: "Kategori berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getKategoriById = async (req, res) => {
  try {
    const { id, id_kategori } = req.params;
    const final_id = id_kategori || id;
    const result = await pool.query(
      "SELECT * FROM kategori_barang WHERE id_kategori=$1 AND sekolah_id=$2",
      [final_id, req.user.sekolah_id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateKategori = async (req, res) => {
  try {
    const { id, id_kategori } = req.params;
    const final_id = id_kategori || id;
    const { nama_kategori, nama } = req.body;
    const final_nama = nama_kategori || nama;

    if (!final_nama) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await pool.query(
      `UPDATE kategori_barang
      SET nama_kategori = $1
      WHERE id_kategori = $2 AND sekolah_id = $3`,
      [final_nama, final_id, req.user.sekolah_id],
    );

    res.json({ message: "Kategori berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteKategori = async (req, res) => {
  try {
    const { id, id_kategori } = req.params;
    const final_id = id_kategori || id;
    await pool.query("DELETE FROM kategori_barang WHERE id_kategori=$1 AND sekolah_id=$2", [
      final_id,
      req.user.sekolah_id,
    ]);
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
