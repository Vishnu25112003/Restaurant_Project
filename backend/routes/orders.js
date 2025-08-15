const express = require("express")
const router = express.Router()
const Order = require("../models/Order") // This is your Order-zGDhvYU5GvUc4OZc5NC947y7Z3G3Nq.js
const CompletedOrder = require("../models/completedOrderModel") // This is your completedOrderModel-T4n7Nmd6CBCqFfdhA9nNaaG7ItZ9c2.js
const { v4: uuidv4 } = require("uuid")

// 📌 GET all orders
router.get("/my-orders", async (req, res) => {
  try {
    const orders = await Order.find()
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" })
  }
})

// 📌 PLACE a new order
router.post("/place-order", async (req, res) => {
  const { foodName, basePrice, addOns, specialInstructions, totalPrice, tableNumber } = req.body

  if (!foodName || !basePrice || !totalPrice || !tableNumber) {
    return res.status(400).json({ message: "All fields (foodName, basePrice, totalPrice, tableNumber) are required" })
  }

  try {
    const newOrder = new Order({
      foodName,
      basePrice,
      addOns,
      specialInstructions,
      totalPrice,
      tableNumber,
    })

    await newOrder.save()
    res.status(201).json({ message: "Order placed successfully!", order: newOrder })
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message })
  }
})

// 📌 DELETE an order
router.delete("/cancel-order/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ message: "Order cancelled successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" })
  }
})

// 📌 MARK orders as paid (archive & delete)
router.post("/mark-paid/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params

  try {
    const ordersToComplete = await Order.find({ tableNumber: Number.parseInt(tableNumber) })

    if (ordersToComplete.length === 0) {
      return res.status(404).json({ message: "No orders found for this table" })
    }

    // Aggregate individual order items into a single completed order entry's items array
    const aggregatedItems = ordersToComplete.map((order) => ({
      foodName: order.foodName,
      totalPrice: order.totalPrice,
      specialInstructions: order.specialInstructions,
    }))

    const totalAmountForTable = ordersToComplete.reduce((sum, order) => sum + order.totalPrice, 0)

    // Create a unique orderId for this completed transaction
    const newCompletedOrderId = uuidv4()

    // Create the new CompletedOrder document
    const newCompletedOrder = new CompletedOrder({
      orderId: newCompletedOrderId,
      tableNumber: Number.parseInt(tableNumber),
      items: aggregatedItems,
      supplierId: "default_supplier_id", // TODO: Replace with actual supplier ID from your system
      supplierName: "Default Supplier", // TODO: Replace with actual supplier name from your system
      totalAmount: totalAmountForTable,
      completedAt: new Date(),
    })

    await newCompletedOrder.save() // Save to the completed orders collection
    await Order.deleteMany({ tableNumber: Number.parseInt(tableNumber) }) // Delete from active orders

    res.status(200).json({
      message: `Orders for Table ${tableNumber} marked as paid and cleared.`,
      completedOrder: newCompletedOrder,
    })
  } catch (error) {
    console.error("Error processing payment and archiving orders:", error)
    res.status(500).json({ message: "Server error processing payment and archiving orders." })
  }
})

module.exports = router
