import { Router } from "express";
import { getAllBarang, createBarang, updateBarang, deleteBarang, getBarangById } from "../controller/barang.controller.js";
import { verifyToken, authorizeRole} from "../middleware/auth.js"

const router = Router();

router.get("/", verifyToken, authorizeRole("admin", "petugas"), getAllBarang);
router.post("/", verifyToken, authorizeRole("admin"), createBarang);
router.put("/:id", verifyToken, authorizeRole("admin"), updateBarang);
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteBarang);
router.get("/:id", verifyToken, authorizeRole("admin"), getBarangById);

export default router;