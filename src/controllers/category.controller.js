import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.create(req.body);

    return res
      .status(201)
      .json(new ApiResponse(201, category, "category created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while creating category"
    );
  }
});

export const fetchCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find();

    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "categories fetched successfully")
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while fetching categories"
    );
  }
});
