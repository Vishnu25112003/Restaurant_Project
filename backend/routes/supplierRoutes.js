// /backend/routes/supplierRoutes.js
const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

router.route("/")
  .get(supplierController.getAllSuppliers)
  .post(supplierController.createSupplier);

router.route("/:id")
  .patch(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier); // Add this line


router.route("/send-notification")
  .post(supplierController.sendNotification);

module.exports = router;