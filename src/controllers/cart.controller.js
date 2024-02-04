import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const cartData = req.body;

    const cart = await Cart.create({
      ...cartData,
      user: userId,
    });
    if (!cart) {
      throw new ApiError(500, "failed to add product in cart");
    }

    const createdCart = await Cart.findById(cart?._id).populate("product");

    return res
      .status(201)
      .json(new ApiResponse(201, createdCart, "product added successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while adding product in cart"
    );
  }
});

export const updateCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cartData = req.body;

    const cart = await Cart.findByIdAndUpdate(
      id,
      {
        $set: {
          ...cartData,
        },
      },
      { new: true }
    ).populate("product");
    if (!cart) {
      throw new ApiError(500, "failed to update product in cart");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "cart updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while updating product in cart"
    );
  }
});

export const deleteFromCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await Cart.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "product deleted from cart successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while deleting product from cart"
    );
  }
});

export const fetchCartByUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    const cartItems = await Cart.find({ user: userId }).populate("product");

    return res
      .status(200)
      .json(new ApiResponse(200, cartItems, "user cart fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while fetching user cart"
    );
  }
});
