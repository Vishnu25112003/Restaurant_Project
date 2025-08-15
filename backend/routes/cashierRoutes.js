const express = require("express")
const router = express.Router()
const { getAllCompletedOrders } = require("../controllers/completedOrderController")

// GET /api/completedorders - Fetch all completed orders for cashier
router.get("/completedorders", getAllCompletedOrders)

module.exports = router
