import { pool } from "../config/db.js";

export const create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { kelas_id, nama_peminjam, items } = req.body;
    // items = [{ barang_id: 1, jumlah: 2 }]

    await client.query("BEGIN");

    console.log("Creating peminjaman for user:", req.user);
    const userId = req.user?.id_users || req.user?.id;
    console.log("Resolved userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Sesi anda tidak valid. Silakan login kembali." });
    }

    const peminjaman = await client.query(
      `INSERT INTO peminjaman
       (admin_id, kelas_id, nama_peminjam, tgl_rencana_kembali, sekolah_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id_peminjaman`,
      [userId, kelas_id, nama_peminjam, req.body.tgl_rencana_kembali, req.user.sekolah_id],
    );

    const idPeminjaman = peminjaman.rows[0].id_peminjaman;

    for (let item of items) {
      await client.query(
        `INSERT INTO detail_peminjaman
         (peminjaman_id, barang_id, jumlah)
         VALUES ($1,$2,$3)`,
        [idPeminjaman, item.barang_id, item.jumlah],
      );

      await client.query(
        `UPDATE barang 
         SET jumlah_total = jumlah_total - $1
         WHERE id_barang = $2`,
        [item.jumlah, item.barang_id],
      );
    }

    await client.query("COMMIT");
    res.json({ id_peminjaman: idPeminjaman });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const kembali = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { items } = req.body;
    // items = [{ barang_id: 1, jumlah: 2, kondisi: "baik" }]

    await client.query("BEGIN");

    await client.query(
      "UPDATE peminjaman SET status='selesai', tgl_kembali=NOW() WHERE id_peminjaman=$1",
      [id],
    );

    for (let item of items) {
      const jumlah_baik = Number(item.jumlah_baik) || 0;
      const jumlah_rusak = Number(item.jumlah_rusak) || 0;

      // 1. Process baik
      if (jumlah_baik > 0) {
        await client.query(
          `UPDATE barang 
           SET jumlah_total = jumlah_total + $1
           WHERE id_barang = $2`,
          [jumlah_baik, item.barang_id]
        );
      }

      // 2. Process rusak
      if (jumlah_rusak > 0) {
        // Find original barang to get details
        const origBarangRes = await client.query(
          `SELECT nama_barang, kategori_id, lokasi, kode_barang, sekolah_id FROM barang WHERE id_barang = $1`,
          [item.barang_id]
        );
        
        if (origBarangRes.rows.length > 0) {
          const origBarang = origBarangRes.rows[0];
          const namaRusak = origBarang.nama_barang + " (Rusak)";
          const sekolahId = origBarang.sekolah_id;
          
          // Check if "Rusak" variant exists
          const checkRusak = await client.query(
            `SELECT id_barang FROM barang WHERE nama_barang = $1 AND kategori_id = $2 AND sekolah_id = $3`,
            [namaRusak, origBarang.kategori_id, sekolahId]
          );

          if (checkRusak.rows.length > 0) {
            // Update existing damaged item
            const rusakBarangId = checkRusak.rows[0].id_barang;
            await client.query(
              `UPDATE barang 
               SET jumlah_total = jumlah_total + $1
               WHERE id_barang = $2`,
              [jumlah_rusak, rusakBarangId]
            );
          } else {
            // Create new damaged item record
            await client.query(
              `INSERT INTO barang (kode_barang, nama_barang, kategori_id, jumlah_total, lokasi, kondisi, status, sekolah_id) 
               VALUES ($1, $2, $3, $4, $5, 'rusak', 'tidak tersedia', $6)`,
              [origBarang.kode_barang + "-R", namaRusak, origBarang.kategori_id, jumlah_rusak, origBarang.lokasi, sekolahId]
            );
          }
        }
      }

      // 3. Update detail_peminjaman
      let kondisiKembali = 'baik';
      if (jumlah_rusak > 0 && jumlah_baik > 0) {
        kondisiKembali = 'sebagian rusak';
      } else if (jumlah_rusak > 0 && jumlah_baik === 0) {
        kondisiKembali = 'rusak';
      }

      await client.query(
        `UPDATE detail_peminjaman 
         SET kondisi_kembali=$1
         WHERE peminjaman_id=$2 AND barang_id=$3`,
        [kondisiKembali, id, item.barang_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Barang dikembalikan" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, k.nama_kelas, u.username as nama_petugas
      FROM peminjaman p
      LEFT JOIN kelas k ON p.kelas_id = k.id_kelas
      LEFT JOIN users u ON p.admin_id = u.id_users
      WHERE p.sekolah_id = $1
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [req.user.sekolah_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const peminjaman = await pool.query(
      `
      SELECT p.*, k.nama_kelas 
      FROM peminjaman p
      LEFT JOIN kelas k ON p.kelas_id = k.id_kelas
      WHERE p.id_peminjaman = $1 AND p.sekolah_id = $2
    `,
      [id, req.user.sekolah_id],
    );

    if (peminjaman.rows.length === 0) {
      return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    }

    const detailResult = await pool.query(
      `
      SELECT dp.*, b.nama_barang 
      FROM detail_peminjaman dp
      LEFT JOIN barang b ON dp.barang_id = b.id_barang
      WHERE dp.peminjaman_id = $1
    `,
      [id],
    );

    res.json({
      ...peminjaman.rows[0],
      items: detailResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_peminjam, kelas_id, tgl_rencana_kembali } = req.body;

    await pool.query(
      `UPDATE peminjaman 
       SET nama_peminjam = $1, kelas_id = $2, tgl_rencana_kembali = $3
       WHERE id_peminjaman = $4 AND sekolah_id = $5`,
      [nama_peminjam, kelas_id, tgl_rencana_kembali, id, req.user.sekolah_id]
    );

    res.json({ message: "Data peminjaman diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query("BEGIN");

    // Check status first
    const check = await client.query("SELECT status FROM peminjaman WHERE id_peminjaman = $1 AND sekolah_id = $2", [id, req.user.sekolah_id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    }

    const { status } = check.rows[0];

    // If still borrowed, restore stock
    if (status === 'dipinjam') {
      const details = await client.query("SELECT * FROM detail_peminjaman WHERE peminjaman_id = $1", [id]);
      for (let item of details.rows) {
        await client.query(
          "UPDATE barang SET jumlah_total = jumlah_total + $1 WHERE id_barang = $2",
          [item.jumlah, item.barang_id]
        );
      }
    }

    // Delete details and then parent
    await client.query("DELETE FROM detail_peminjaman WHERE peminjaman_id = $1", [id]);
    await client.query("DELETE FROM peminjaman WHERE id_peminjaman = $1 AND sekolah_id = $2", [id, req.user.sekolah_id]);

    await client.query("COMMIT");
    res.json({ message: "Peminjaman berhasil dihapus" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getStats = async (req, res) => {
  try {
    const barangCount = await pool.query("SELECT COUNT(*) FROM barang WHERE sekolah_id = $1", [req.user.sekolah_id]);
    const peminjamanCount = await pool.query(
      "SELECT COUNT(*) FROM peminjaman WHERE status = 'dipinjam' AND sekolah_id = $1",
      [req.user.sekolah_id]
    );
    const kelasCount = await pool.query("SELECT COUNT(*) FROM kelas WHERE sekolah_id = $1", [req.user.sekolah_id]);

    res.json({
      totalBarang: parseInt(barangCount.rows[0].count),
      totalPeminjaman: parseInt(peminjamanCount.rows[0].count),
      totalKelas: parseInt(kelasCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
