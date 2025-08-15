const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const PaidOrder = require("../models/PaidOrder");

// GET all orders
router.get("/my-orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Place a new order
router.post("/place-order", async (req, res) => {
  const { foodName, basePrice, addOns, specialInstructions, totalPrice, tableNumber } = req.body;

  if (!foodName || !basePrice || !totalPrice || !tableNumber) {
    return res.status(400).json({ 
      message: "Required fields missing: foodName, basePrice, totalPrice, tableNumber" 
    });
  }

  try {
    const newOrder = new Order({
      foodName,
      basePrice,
      addOns,
      specialInstructions,
      totalPrice,
      tableNumber,
    });

    await newOrder.save();
    res.status(201).json({ 
      message: "Order placed successfully!", 
      order: newOrder 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error placing order", 
      error: error.message 
    });
  }
});

// Cancel an order
router.delete("/cancel-order/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" });
  }
});

// Mark orders as paid (archive & delete)
router.post("/mark-paid/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const orders = await Order.find({ 
      tableNumber: parseInt(tableNumber) 
    });

    if (orders.length === 0) {
      return res.status(404).json({ 
        message: "No orders found for this table" 
      });
    }

    // Prepare archived orders with paidAt timestamp
    const archivedOrders = orders.map((order) => ({
      ...order.toObject(),
      paidAt: new Date(),
    }));

    // Insert into paidorders collection
    await PaidOrder.insertMany(archivedOrders);
    
    // Delete from active orders
    await Order.deleteMany({ tableNumber: parseInt(tableNumber) });

    res.status(200).json({ 
      message: `Orders for Table ${tableNumber} archived and cleared.` 
    });
  } catch (error) {
    console.error("Error archiving orders:", error);
    res.status(500).json({ 
      message: "Server error archiving orders." 
    });
  }
});

module.exports = router;