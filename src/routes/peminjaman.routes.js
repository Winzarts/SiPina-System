import { Router } from "express";
import {
  create,
  kembali,
  getAll,
  getById,
  getStats,
  update,
  remove as deletePeminjaman,
} from "../controller/peminjaman.controller.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, getAll);
router.get("/stats", verifyToken, getStats);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, authorizeRole("petugas", "admin"), create);
router.put(
  "/:id/kembali",
  verifyToken,
  authorizeRole("petugas", "admin"),
  kembali,
);
router.put("/:id", verifyToken, authorizeRole("petugas", "admin"), update);
router.delete("/:id", verifyToken, authorizeRole("petugas", "admin"), deletePeminjaman);

export default router;
