import { Router } from "express";
import {
  createCategory,
  fetchCategories,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createCategory).get("/", fetchCategories);

export default router;
