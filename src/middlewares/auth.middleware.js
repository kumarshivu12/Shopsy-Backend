import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.authToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "invalid access token");
    }
    console.log(token);

    const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "_id name email role"
    );
    if (!user) {
      throw new ApiError(401, "unauthorized user");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while verifying user"
    );
  }
});
