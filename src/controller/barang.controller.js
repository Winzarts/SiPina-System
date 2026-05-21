import { pool } from "../config/db.js";
import { hitungStatus } from "../util/statusHelper.js";

export const getAllBarang = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, b.id_barang, b.nama_barang, b.kategori_id AS id_kategori, k.nama_kategori 
      FROM barang b
      LEFT JOIN kategori_barang k ON b.kategori_id = k.id_kategori
      WHERE b.sekolah_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.sekolah_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBarang = async (req, res) => {
  console.log("POST /barang - Payload received:", req.body);
  try {
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      jumlah_total,
      lokasi,
      kondisi,
    } = req.body;

    const final_kategori_id = id_kategori || req.body.kategori_id;

    if (!nama_barang || !final_kategori_id || jumlah_total == null) {
      console.warn("POST /barang - Validation failed:", {
        nama_barang,
        final_kategori_id,
        jumlah_total,
      });
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const normalized_kondisi = kondisi
      ? kondisi.toLowerCase().includes("rusak")
        ? "rusak"
        : "baik"
      : "baik";
    const status = hitungStatus(jumlah_total, normalized_kondisi);

    await pool.query(
      `INSERT INTO barang 
      (kode_barang, nama_barang, kategori_id, jumlah_total, lokasi, kondisi, status, sekolah_id) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        kode_barang,
        nama_barang,
        final_kategori_id,
        jumlah_total,
        lokasi,
        normalized_kondisi,
        status.toLowerCase(),
        req.user.sekolah_id,
      ],
    );

    res.json({ message: "Barang berhasil ditambahkan" });
  } catch (err) {
    console.error("POST /barang - Error:", err);
    res
      .status(500)
      .json({ error: err.message, detail: "Database insertion failed" });
  }
};

export const updateBarang = async (req, res) => {
  console.log(
    `PUT /barang/${req.params.id || req.params.id_barang} - Payload received:`,
    req.body,
  );
  try {
    const { id, id_barang } = req.params;
    const final_id = id_barang || id;
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      jumlah_total,
      lokasi,
      kondisi,
    } = req.body;

    const final_kategori_id = id_kategori || req.body.kategori_id;
    const normalized_kondisi = kondisi
      ? kondisi.toLowerCase().includes("rusak")
        ? "rusak"
        : "baik"
      : "baik";
    const status = hitungStatus(jumlah_total, normalized_kondisi);

    await pool.query(
      `UPDATE barang 
       SET kode_barang=$1, nama_barang=$2, kategori_id=$3, 
           jumlah_total=$4, lokasi=$5, kondisi=$6, status=$7 
       WHERE id_barang=$8 AND sekolah_id=$9`,
      [
        kode_barang,
        nama_barang,
        final_kategori_id,
        jumlah_total,
        lokasi,
        normalized_kondisi,
        status.toLowerCase(),
        final_id,
        req.user.sekolah_id,
      ],
    );

    res.json({ message: "Barang berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBarang = async (req, res) => {
  const { id, id_barang } = req.params;
  const final_id = id_barang || id;
  console.log(`DELETE /barang/${final_id} - Attempting to delete`);
  try {
    const result = await pool.query("DELETE FROM barang WHERE id_barang=$1 AND sekolah_id=$2", [
      final_id,
      req.user.sekolah_id,
    ]);
    if (result.rowCount === 0) {
      console.warn(`DELETE /barang/${final_id} - No barang found with this ID`);
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }
    console.log(`DELETE /barang/${final_id} - Successfully deleted`);
    res.json({ message: "Barang berhasil dihapus" });
  } catch (err) {
    console.error(`DELETE /barang/${final_id} - Error:`, err);
    res.status(500).json({ error: err.message });
  }
};

export const getBarangById = async (req, res) => {
  try {
    const { id, id_barang } = req.params;
    const final_id = id_barang || id;
    const result = await pool.query(
      `
      SELECT b.*, b.id_barang, b.nama_barang, b.kategori_id AS id_kategori, k.nama_kategori 
      FROM barang b
      LEFT JOIN kategori_barang k ON b.kategori_id = k.id_kategori
      WHERE b.id_barang=$1 AND b.sekolah_id=$2
    `,
      [final_id, req.user.sekolah_id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
