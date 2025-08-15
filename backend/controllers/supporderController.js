// controllers/supporderController.js
const SuppOrder = require("../models/supporderModel");

exports.getSupplierOrders = async (req, res) => {
  try {
    const { supplierNameOrId } = req.params;

    // Clean up input
    const identifier = supplierNameOrId.replace(/\s+/g, "").replace(/:/g, "");

    console.log("🔍 Searching for:", identifier);

    const orders = await SuppOrder.find({
      $or: [
        { supplierId: identifier },
        { supplierName: identifier }
      ],
    });

    if (!orders.length) return res.status(200).json([]);

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};