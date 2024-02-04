import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const fetchUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId).select(
      "_id name email role addresses"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, user, "user fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while fetching user"
    );
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { ...userData },
      },
      { new: true }
    ).select("_id name email role addresses");

    return res
      .status(201)
      .json(new ApiResponse(201, user, "user updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "somenthing went wrong while updating user"
    );
  }
});
