import { Router } from "express";
import {
  getAllKelas,
  createKelas,
  updateKelas,
  deleteKelas,
} from "../controller/kelas.controller.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, authorizeRole("admin", "petugas"), getAllKelas);
router.post("/", verifyToken, authorizeRole("admin"), createKelas);
router.put("/:id_kelas", verifyToken, authorizeRole("admin"), updateKelas);
router.delete("/:id_kelas", verifyToken, authorizeRole("admin"), deleteKelas);

export default router;
