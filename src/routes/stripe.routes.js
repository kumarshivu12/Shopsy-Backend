import { Router } from "express";
import { createStripeSession } from "../controllers/stripe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/create-session", createStripeSession);

export default router;
