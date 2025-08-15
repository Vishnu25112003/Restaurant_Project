// models/supporderModel.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodName: String,
  totalPrice: Number,
  specialInstructions: String,
});

const SuppOrder = mongoose.model(
  "SuppOrder",
  new mongoose.Schema({
    orderId: String,
    tableNumber: Number,
    items: [orderItemSchema],
    supplierId: String,
    supplierName: String,
    createdAt: Date,
  }),
  "confirmedorders" // 👈 This tells Mongoose to use the correct collection
);

module.exports = SuppOrder;