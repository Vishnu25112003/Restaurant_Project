const mongoose = require("mongoose")

const completedOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    items: [
      {
        foodName: {
          type: String,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        specialInstructions: {
          type: String,
          default: "",
        },
      },
    ],
    supplierId: {
      type: String,
      required: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    // ✅ NEW: Refund fields
    refundStatus: {
      type: String,
      enum: ["none", "processed", "failed"],
      default: "none",
    },
    refundPaymentId: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Create index for better query performance
completedOrderSchema.index({ supplierId: 1, completedAt: -1 })
completedOrderSchema.index({ orderId: 1 })
completedOrderSchema.index({ refundStatus: 1, refundedAt: -1 })

const CompletedOrder = mongoose.model("CompletedOrder", completedOrderSchema)

module.exports = CompletedOrder
