import { Router } from "express";
import { createBrand, fetchBrands } from "../controllers/brand.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createBrand).get("/", fetchBrands);

export default router;
