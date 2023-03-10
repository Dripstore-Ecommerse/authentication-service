import express from "express";
import { login, register, me, logout } from "../controller/auth";
import { protect } from "@dripstore/common/build";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.get("/me", protect, me);

export default router;
