const express = require("express")
const router = express.Router()
const {
  getAllVendors,
  getVendorById,
  getVendorBySupplierId,
  createVendor,
  updateVendor,
  updateVendorAttendance,
  verifyVendorLogin,
  deleteVendor,
  getVendorsByAttendance,
} = require("../controllers/vendorController")

// GET routes - using 'suppliers' in the route path to match your existing data
router.get("/suppliers", getAllVendors) // This will fetch from your existing suppliers collection
router.get("/suppliers/attendance/:attendance", getVendorsByAttendance)
router.get("/suppliers/supplier/:supplierId", getVendorBySupplierId)
router.get("/suppliers/:id", getVendorById)

// POST routes
router.post("/suppliers", createVendor)
router.post("/suppliers/login", verifyVendorLogin) // This is the login endpoint

// PUT routes
router.put("/suppliers/:id", updateVendor)
router.put("/suppliers/:id/attendance", updateVendorAttendance)

// DELETE routes
router.delete("/suppliers/:id", deleteVendor)

module.exports = router
