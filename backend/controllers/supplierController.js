// controllers/supplierController.js
const Supplier = require("../models/supplierModel");
const ConfirmedOrder = require("../models/confirmedOrderModel");

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, supplierId, password, attendance } = req.body;

    if (!name || !supplierId || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const supplier = new Supplier({
      name,
      supplierId,
      password,
      attendance: attendance || "Present",
      status: attendance === "Absent" ? "Absent" : "Available",
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Supplier ID must be unique" });
    }
    res.status(400).json({ error: err.message });
  }
};

// Update supplier by ID
exports.updateSupplier = async (req, res) => {
  try {
    const { name, supplierId, password, attendance } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (supplierId) updateData.supplierId = supplierId;
    if (password) updateData.password = password;
    if (attendance !== undefined) {
      if (!["Present", "Absent"].includes(attendance)) {
        return res.status(400).json({ error: "Attendance must be Present or Absent" });
      }
      updateData.attendance = attendance;
      updateData.status = attendance === "Absent" ? "Absent" : "Available";
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!supplier) return res.status(404).json({ error: "Supplier not found" });

    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().select("-password");
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save confirmed order to database
exports.sendNotification = async (req, res) => {
  try {
    const { supplierId, supplierName, orderId, tableNumber, items } = req.body;

    if (!supplierId || !supplierName || !orderId || !tableNumber || !items.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Updating supplier with ID:", supplierId);

    // Update supplier status to 'Busy'
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { supplierId },
      { status: "Busy" },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Save to ConfirmedOrder collection
    const confirmedOrder = new ConfirmedOrder({
      supplierId,
      supplierName,
      orderId,
      tableNumber,
      items,
    });

    await confirmedOrder.save();

    res.json({
      message: "Order confirmed and assigned successfully",
      order: confirmedOrder,
    });
  } catch (err) {
    console.error("Error assigning order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete supplier by ID
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json({ 
      message: "Supplier deleted successfully",
      deletedSupplier: {
        id: supplier._id,
        name: supplier.name,
        supplierId: supplier.supplierId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};