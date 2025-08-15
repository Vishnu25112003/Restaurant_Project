const mongoose = require("mongoose")

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    supplierId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      enum: ["Present", "Absent"],
      default: "Present",
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "suppliers", // This will use your existing "suppliers" collection
  },
)

// Index for faster queries
vendorSchema.index({ supplierId: 1 })
vendorSchema.index({ attendance: 1 })
vendorSchema.index({ status: 1 })

module.exports = mongoose.model("Vendor", vendorSchema)
