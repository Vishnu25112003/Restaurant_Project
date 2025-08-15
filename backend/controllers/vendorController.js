const Vendor = require("../models/vendorModel")

// Get all vendors from suppliers collection
const getAllVendors = async (req, res) => {
  try {
    console.log("Fetching all suppliers from database...")
    const vendors = await Vendor.find().select("-password")
    console.log(`Found ${vendors.length} suppliers:`, vendors)
    res.status(200).json(vendors)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    res.status(500).json({
      message: "Error fetching suppliers",
      error: error.message,
    })
  }
}

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Fetching supplier by ID:", id)
    const vendor = await Vendor.findById(id).select("-password")

    if (!vendor) {
      console.log("Supplier not found with ID:", id)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Found supplier:", vendor)
    res.status(200).json(vendor)
  } catch (error) {
    console.error("Error fetching supplier:", error)
    res.status(500).json({
      message: "Error fetching supplier",
      error: error.message,
    })
  }
}

// Get vendor by supplier ID
const getVendorBySupplierId = async (req, res) => {
  try {
    const { supplierId } = req.params
    console.log("Fetching supplier by supplierId:", supplierId)
    const vendor = await Vendor.findOne({ supplierId }).select("-password")

    if (!vendor) {
      console.log("Supplier not found with supplierId:", supplierId)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Found supplier:", vendor)
    res.status(200).json(vendor)
  } catch (error) {
    console.error("Error fetching supplier:", error)
    res.status(500).json({
      message: "Error fetching supplier",
      error: error.message,
    })
  }
}

// Create new vendor
const createVendor = async (req, res) => {
  try {
    const { name, supplierId, password, attendance, status, email, phone, address } = req.body
    console.log("Creating new supplier:", { name, supplierId, attendance, status })

    // Check if vendor with same supplierId already exists
    const existingVendor = await Vendor.findOne({ supplierId })
    if (existingVendor) {
      console.log("Supplier already exists with supplierId:", supplierId)
      return res.status(400).json({ message: "Supplier with this ID already exists" })
    }

    const newVendor = new Vendor({
      name,
      supplierId,
      password,
      attendance: attendance || "Present",
      status: status || "Present",
      email,
      phone,
      address,
    })

    const savedVendor = await newVendor.save()
    console.log("Supplier created successfully:", savedVendor)

    // Return vendor without password
    const vendorResponse = savedVendor.toObject()
    delete vendorResponse.password

    res.status(201).json({
      message: "Supplier created successfully",
      vendor: vendorResponse,
    })
  } catch (error) {
    console.error("Error creating supplier:", error)
    res.status(500).json({
      message: "Error creating supplier",
      error: error.message,
    })
  }
}

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    console.log("Updating supplier:", id, updateData)

    // Remove password from update data if it's empty
    if (updateData.password === "") {
      delete updateData.password
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!updatedVendor) {
      console.log("Supplier not found for update:", id)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Supplier updated successfully:", updatedVendor)
    res.status(200).json({
      message: "Supplier updated successfully",
      vendor: updatedVendor,
    })
  } catch (error) {
    console.error("Error updating supplier:", error)
    res.status(500).json({
      message: "Error updating supplier",
      error: error.message,
    })
  }
}

// Update vendor attendance
const updateVendorAttendance = async (req, res) => {
  try {
    const { id } = req.params
    const { attendance, status } = req.body
    console.log("Updating supplier attendance:", id, { attendance, status })

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      {
        attendance: attendance || status,
        status: status || attendance,
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedVendor) {
      console.log("Supplier not found for attendance update:", id)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Supplier attendance updated successfully:", updatedVendor)
    res.status(200).json({
      message: "Supplier attendance updated successfully",
      vendor: updatedVendor,
    })
  } catch (error) {
    console.error("Error updating supplier attendance:", error)
    res.status(500).json({
      message: "Error updating supplier attendance",
      error: error.message,
    })
  }
}

// Verify vendor login
const verifyVendorLogin = async (req, res) => {
  try {
    const { supplierId, password } = req.body
    console.log("Login attempt for supplierId:", supplierId)

    if (!supplierId || !password) {
      console.log("Missing supplierId or password")
      return res.status(400).json({ message: "Supplier ID and password are required" })
    }

    const vendor = await Vendor.findOne({ supplierId: supplierId })
    console.log("Found supplier for login:", vendor ? vendor.name : "Not found")

    if (!vendor) {
      console.log("Supplier not found with supplierId:", supplierId)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Comparing passwords:", { provided: password, stored: vendor.password })
    if (vendor.password !== password) {
      console.log("Password mismatch for supplier:", supplierId)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    console.log("Checking attendance status:", { attendance: vendor.attendance, status: vendor.status })
    if (vendor.attendance === "Absent" || vendor.status === "Absent") {
      console.log("Supplier is absent:", supplierId)
      return res.status(403).json({ message: "Supplier is currently absent" })
    }

    // Update last login
    await Vendor.findByIdAndUpdate(vendor._id, { lastLogin: new Date() })
    console.log("Login successful for supplier:", vendor.name)

    // Return vendor without password
    const vendorResponse = vendor.toObject()
    delete vendorResponse.password

    res.status(200).json({
      message: "Login successful",
      vendor: vendorResponse,
    })
  } catch (error) {
    console.error("Error verifying supplier login:", error)
    res.status(500).json({
      message: "Error verifying login",
      error: error.message,
    })
  }
}

// Delete vendor (soft delete)
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Deleting supplier:", id)

    const updatedVendor = await Vendor.findByIdAndUpdate(id, { isActive: false }, { new: true }).select("-password")

    if (!updatedVendor) {
      console.log("Supplier not found for deletion:", id)
      return res.status(404).json({ message: "Supplier not found" })
    }

    console.log("Supplier deleted successfully:", updatedVendor)
    res.status(200).json({
      message: "Supplier deleted successfully",
      vendor: updatedVendor,
    })
  } catch (error) {
    console.error("Error deleting supplier:", error)
    res.status(500).json({
      message: "Error deleting supplier",
      error: error.message,
    })
  }
}

// Get vendors by attendance status
const getVendorsByAttendance = async (req, res) => {
  try {
    const { attendance } = req.params // 'Present' or 'Absent'
    console.log("Fetching suppliers by attendance:", attendance)

    const vendors = await Vendor.find({
      $or: [{ attendance: attendance }, { status: attendance }],
    }).select("-password")

    console.log(`Found ${vendors.length} suppliers with attendance ${attendance}:`, vendors)
    res.status(200).json(vendors)
  } catch (error) {
    console.error("Error fetching suppliers by attendance:", error)
    res.status(500).json({
      message: "Error fetching suppliers by attendance",
      error: error.message,
    })
  }
}

module.exports = {
  getAllVendors,
  getVendorById,
  getVendorBySupplierId,
  createVendor,
  updateVendor,
  updateVendorAttendance,
  verifyVendorLogin,
  deleteVendor,
  getVendorsByAttendance,
}
