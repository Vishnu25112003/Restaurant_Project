// routes/supporderRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/supporderController");

router.get("/:supplierNameOrId", controller.getSupplierOrders);

module.exports = router;