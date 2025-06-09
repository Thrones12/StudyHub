const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification");

// Get all
router.get("/", notificationController.getAll);

// Get one by ID
router.get("/:id", notificationController.getOne);

// Create
router.post("/", notificationController.create);

// Update by ID
router.put("/:id", notificationController.update);

// Delete by ID
router.delete("/:id", notificationController.delete);

module.exports = router;
