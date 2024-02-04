import mongoose, { Schema } from "mongoose";

const paymentMethods = {
  values: ["card", "cash"],
  message: "enum validator failed for payment Methods",
};

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    totalItems: {
      type: Number,
    },
    selectedAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: paymentMethods,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
