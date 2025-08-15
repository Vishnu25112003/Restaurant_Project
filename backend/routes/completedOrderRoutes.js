const express = require("express")
const router = express.Router()
const {
  completeOrder,
  getCompletedOrdersBySupplier,
  getAllCompletedOrders,
  getCompletedOrderStats,
} = require("../controllers/completedOrderController")

// POST /orderdone/complete - Mark an order as completed
router.post("/complete", completeOrder)

// GET /orderdone/supplier/:supplierId - Get completed orders by supplier
router.get("/supplier/:supplierId", getCompletedOrdersBySupplier)

// GET /orderdone/all - Get all completed orders (admin)
router.get("/all", getAllCompletedOrders)

// GET /orderdone/stats/:supplierId? - Get completed order statistics
router.get("/stats/:supplierId?", getCompletedOrderStats)

module.exports = router
