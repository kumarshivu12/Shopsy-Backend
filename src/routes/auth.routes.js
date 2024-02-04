import { Router } from "express";
import {
  checkAuth,
  createUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .post("/signup", createUser)
  .post("/login", loginUser)
  .get("/check", verifyJWT, checkAuth)
  .get("/logout", verifyJWT, logoutUser);
//   .post("/reset-password-request", resetPasswordRequest)
//   .post("/reset-password", resetPassword);

export default router;
