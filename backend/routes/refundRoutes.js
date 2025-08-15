const express = require("express")
const router = express.Router()
const CompletedOrder = require("../models/completedOrderModel")

// POST /api/refund - Process refund for completed order
router.post("/refund", async (req, res) => {
  try {
    const { orderId, paymentId, refundAmount } = req.body

    if (!orderId || !paymentId || !refundAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for refund processing",
      })
    }

    // Find the completed order
    const completedOrder = await CompletedOrder.findById(orderId)
    if (!completedOrder) {
      return res.status(404).json({
        success: false,
        message: "Completed order not found",
      })
    }

    // Update the order with refund information
    completedOrder.refundStatus = "processed"
    completedOrder.refundPaymentId = paymentId
    completedOrder.refundAmount = refundAmount
    completedOrder.refundedAt = new Date()

    await completedOrder.save()

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        orderId: completedOrder._id,
        refundPaymentId: paymentId,
        refundAmount,
      },
    })
  } catch (error) {
    console.error("Error processing refund:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while processing refund",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// GET /api/refunds - Get all refunded orders
router.get("/refunds", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const refundedOrders = await CompletedOrder.find({ refundStatus: "processed" })
      .sort({ refundedAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await CompletedOrder.countDocuments({ refundStatus: "processed" })

    res.status(200).json({
      success: true,
      data: refundedOrders,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + refundedOrders.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching refunded orders:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

module.exports = router
