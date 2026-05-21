import { Router } from "express";
import { getAllKategori, createKategori, updateKategori, deleteKategori, getKategoriById } from "../controller/kategori.controller.js";
import { verifyToken, authorizeRole} from "../middleware/auth.js"

const router = Router();

router.get("/", verifyToken, authorizeRole("admin", "petugas"), getAllKategori);
router.post("/", verifyToken, authorizeRole("admin"), createKategori);
router.put("/:id", verifyToken, authorizeRole("admin"), updateKategori);
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteKategori);
router.get(
  "/:id",
  verifyToken,
  authorizeRole("admin", "petugas"),
  getKategoriById,
);

export default router;