// /backend/models/supplierModel.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  supplierId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  attendance: {
    type: String,
    enum: ["Present", "Absent"],
    default: "Present",
  },
  status: {
    type: String,
    enum: ["Available", "Busy", "Absent"],
    default: function () {
      return this.attendance === "Absent" ? "Absent" : "Available";
    },
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);