const mongoose = require("mongoose");

const confirmedOrderSchema = new mongoose.Schema({
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
      id: String,
      foodName: String,
      totalPrice: Number,
      addOns: [String],
      specialInstructions: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ConfirmedOrder", confirmedOrderSchema);