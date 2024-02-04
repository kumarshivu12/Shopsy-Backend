import { Router } from "express";
import {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .post("/", createProduct)
  .patch("/:id", updateProduct)
  .get("/:id", fetchProductById)
  .get("/", fetchAllProducts);

export default router;
