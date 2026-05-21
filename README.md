# KIK - Backend API

KIK (Kartu Inventaris Kelas) Backend adalah RESTful API yang dibangun menggunakan Node.js dan Express untuk mengelola inventaris barang di sekolah. Sistem ini mencakup manajemen data barang, kategori, kelas, sekolah, serta pencatatan peminjaman barang.

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi**: Pengamanan menggunakan JSON Web Token (JWT) dengan dukungan role-based access control (Admin & Petugas).
- **Manajemen Barang**: Operasi CRUD untuk data barang inventaris.
- **Manajemen Kategori**: Pengelompokan barang berdasarkan kategori.
- **Manajemen Kelas**: Pengelolaan data kelas di sekolah.
- **Manajemen Sekolah**: Informasi profil sekolah.
- **Transaksi Peminjaman**: Pencatatan peminjaman dan pengembalian barang beserta statistik.

## 🛠️ Stack Teknologi

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Security**: JWT & Bcrypt
- **Environment**: Dotenv

## 📋 Prasyarat

- Node.js (v18+)
- PostgreSQL Database

## ⚙️ Instalasi

1. Clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di root direktori dan sesuaikan konfigurasinya:
   ```env
   PORT=4000
   DB_URL=postgresql://username:password@localhost:5432/database_name
   JWT_SECRET=your_jwt_secret_key
   ```
4. Jalankan aplikasi:
   ```bash
   # Mode Development
   npx nodemon index.js

   # Mode Produksi
   node index.js
   ```

## 🛤️ Endpoint API Summary

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login user |
| GET | `/barang` | Ambil semua data barang |
| GET | `/peminjaman/stats` | Statistik peminjaman |
| PUT | `/peminjaman/:id/kembali` | Proses pengembalian barang |

*(Lihat file di folder `src/routes` untuk detail endpoint lainnya)*

## 📂 Struktur Folder

```text
KIK/
├── src/
│   ├── config/      # Konfigurasi database
│   ├── controller/  # Logika bisnis
│   ├── lib/         # Library/helper
│   ├── middleware/  # Middleware Express (Auth, dll)
│   ├── routes/      # Definisi route API
│   └── util/        # Utility functions
├── index.js         # Entry point aplikasi
└── package.json     # Dependensi dan script
```

## 📝 Lisensi

ISC License.
