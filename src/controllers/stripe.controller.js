import stripe from "stripe";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//add apikey hardcoded
const stripeInstance = stripe(process.env.STRIPE_SECRET);

export const createStripeSession = asyncHandler(async (req, res) => {
  try {
    const orderData = req.body;

    const lineItems = orderData.items.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.product.title,
          images: [product.product.thumbnail],
        },
        unit_amount: product.product.discountPrice * 100,
      },
      quantity: +product.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/order-success/${orderData._id}`,
      cancel_url: "http://localhost:5173/order-failure",
    });

    console.log(session);

    return res
      .status(201)
      .json(new ApiResponse(201, session, "product added successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while creating stripe session"
    );
  }
});
