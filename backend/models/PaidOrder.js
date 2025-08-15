const mongoose = require("mongoose");

const PaidOrderSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  basePrice: { type: Number, required: true },
  addOns: [
    {
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    },
  ],
  specialInstructions: { type: String },
  totalPrice: { type: Number, required: true },
  tableNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date, required: true },
});

module.exports = mongoose.model("PaidOrder", PaidOrderSchema);