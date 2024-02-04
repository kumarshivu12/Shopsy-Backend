import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const orderData = req.body;

    const order = await Order.create(orderData);
    if (!order) {
      throw new ApiError(500, "failed to create order");
    }

    for (const item of order.items) {
      const productId = item.product._id;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new ApiError(500, "Failed to update product stock");
      }
    }

    return res
      .status(201)
      .json(new ApiResponse(201, order, "order created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while creating order"
    );
  }
});

export const updateOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          ...orderData,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, order, "order updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while updating order"
    );
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await Order.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "order deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while deleting order"
    );
  }
});

export const fetchOrdersByUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    const order = await Order.find({ user: userId });

    res
      .status(200)
      .json(new ApiResponse(200, order, "user orders fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while fetching user orders"
    );
  }
});

export const fetchAllOrders = asyncHandler(async (req, res) => {
  try {
    const { _sort, _order, _page = 1, _limit = 10 } = req.query;

    const page = parseInt(_page);
    const limit = parseInt(_limit);

    const totalDocsPipeline = [
      { $group: { _id: null, totalDocs: { $sum: 1 } } },
    ];

    const [totalDocsFilter] = await Order.aggregate(totalDocsPipeline);

    const pipeline = [
      {
        $sort:
          _sort && _order
            ? { [_sort]: _order === "desc" ? -1 : 1 }
            : { _id: 1 },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { __v: 0 } },
    ];

    const orders = await Order.aggregate(pipeline);
    const totalDocs = totalDocsFilter ? totalDocsFilter.totalDocs : 0;

    return res
      .status(200)
      .set("X-Total-Count", totalDocs)
      .json(new ApiResponse(200, orders, "orders fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while fetching orders"
    );
  }
});
