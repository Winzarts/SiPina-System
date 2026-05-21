import express from "express";
import {
  getAllSekolah,
  getSekolahById,
  createSekolah,
  updateSekolah,
  deleteSekolah,
} from "../controller/sekolah.controller.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// For now, allow all authenticated users to read, but only admins to modify
router.get("/", verifyToken, getAllSekolah);
router.get("/:id", verifyToken, getSekolahById);
router.post("/", verifyToken, authorizeRole("admin"), createSekolah);
router.put("/:id", verifyToken, authorizeRole("admin"), updateSekolah);
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteSekolah);

export default router;
