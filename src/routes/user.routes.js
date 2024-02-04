import { Router } from "express";
import { fetchUserById, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/own", fetchUserById).patch("/:id", updateUser);

export default router;
