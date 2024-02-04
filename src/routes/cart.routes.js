import { Router } from "express";
import {
  addToCart,
  deleteFromCart,
  fetchCartByUser,
  updateCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .post("/", addToCart)
  .patch("/:id", updateCart)
  .delete("/:id", deleteFromCart)
  .get("/", fetchCartByUser);

export default router;
