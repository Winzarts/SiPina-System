import { Router } from "express";
import {
  register,
  login,
  createPetugas,
  getMe,
  getListPetugas,
  logout,
  sendRegisterOtp,
  sendResetOtp,
  resetPassword,
} from "../controller/auth.controller.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = Router();

router.post("/send-register-otp", sendRegisterOtp);
router.post("/register", register);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post(
  "/create-petugas",
  verifyToken,
  authorizeRole("admin"),
  createPetugas,
);
router.get("/petugas", verifyToken, authorizeRole("admin"), getListPetugas);
router.post("/logout", verifyToken, logout);

export default router;
