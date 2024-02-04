import { Brand } from "../models/brand.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.create(req.body);

    return res
      .status(201)
      .json(new ApiResponse(201, brand, "brand created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while creating brand"
    );
  }
});

export const fetchBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find();

    return res
      .status(200)
      .json(new ApiResponse(200, brands, "brands fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while fetching brands"
    );
  }
});
