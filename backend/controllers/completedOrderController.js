const CompletedOrder = require("../models/completedOrderModel")

// Handle completed order submission
const completeOrder = async (req, res) => {
  try {
    const { orderId, tableNumber, items, supplierId, supplierName, totalAmount, completedAt } = req.body

    // Validate required fields
    if (!orderId || !tableNumber || !items || !supplierId || !supplierName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty",
      })
    }

    // Calculate total amount if not provided or validate if provided
    let calculatedTotal = 0
    for (const item of items) {
      if (!item.foodName || typeof item.totalPrice !== "number") {
        return res.status(400).json({
          success: false,
          message: "Each item must have foodName and totalPrice",
        })
      }
      calculatedTotal += item.totalPrice
    }

    // Use calculated total if totalAmount is not provided or is incorrect
    const finalTotalAmount = totalAmount || calculatedTotal

    // Check if order is already completed
    const existingCompletedOrder = await CompletedOrder.findOne({ orderId })
    if (existingCompletedOrder) {
      return res.status(409).json({
        success: false,
        message: "Order has already been completed",
      })
    }

    // Create new completed order
    const completedOrder = new CompletedOrder({
      orderId,
      tableNumber,
      items,
      supplierId,
      supplierName,
      totalAmount: finalTotalAmount,
      completedAt: completedAt || new Date(),
    })

    // Save to database
    const savedOrder = await completedOrder.save()

    res.status(201).json({
      success: true,
      message: "Order completed successfully",
      data: savedOrder,
    })
  } catch (error) {
    console.error("Error completing order:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Order has already been completed",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get completed orders by supplier
const getCompletedOrdersBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params
    const { page = 1, limit = 10, sortBy = "completedAt", sortOrder = "desc" } = req.query

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID is required",
      })
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

    const completedOrders = await CompletedOrder.find({ supplierId })
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await CompletedOrder.countDocuments({ supplierId })

    res.status(200).json({
      success: true,
      data: completedOrders,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + completedOrders.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching completed orders:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get all completed orders (admin function)
const getAllCompletedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "completedAt", sortOrder = "desc" } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

    const completedOrders = await CompletedOrder.find({}).sort(sort).skip(skip).limit(Number.parseInt(limit))

    const totalCount = await CompletedOrder.countDocuments({})

    res.status(200).json({
      success: true,
      data: completedOrders,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + completedOrders.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching all completed orders:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get completed order statistics
const getCompletedOrderStats = async (req, res) => {
  try {
    const { supplierId } = req.params
    const { startDate, endDate } = req.query

    const matchCondition = {}

    if (supplierId) {
      matchCondition.supplierId = supplierId
    }

    if (startDate || endDate) {
      matchCondition.completedAt = {}
      if (startDate) {
        matchCondition.completedAt.$gte = new Date(startDate)
      }
      if (endDate) {
        matchCondition.completedAt.$lte = new Date(endDate)
      }
    }

    const stats = await CompletedOrder.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          totalItems: { $sum: { $size: "$items" } },
        },
      },
    ])

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            totalItems: 0,
          }

    // Remove the _id field
    delete result._id

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching completed order stats:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

module.exports = {
  completeOrder,
  getCompletedOrdersBySupplier,
  getAllCompletedOrders,
  getCompletedOrderStats,
}
