import "dotenv/config";
import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import kelasRoutes from "./src/routes/kelas.routes.js";
import barangRoutes from "./src/routes/barang.routes.js";
import kategoriRoutes from "./src/routes/kategori.routes.js";
import peminjamanRoutes from "./src/routes/peminjaman.routes.js";
import sekolahRoutes from "./src/routes/sekolah.routes.js";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/kelas", kelasRoutes);
app.use("/barang", barangRoutes);
app.use("/kategori", kategoriRoutes);
app.use("/peminjaman", peminjamanRoutes);
app.use("/sekolah", sekolahRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
