const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification");

// Get all
router.get("/", notificationController.getAll);

// Get one by ID
router.get("/:id", notificationController.getOne);

// Thêm nhắc nhở công việc cho người dùng
router.post("/reminder", notificationController.reminder);

// Thêm nhắc nhở công việc cho người dùng
router.post("/toAll", notificationController.notiToAll);

// Create
router.post("/", notificationController.create);
// Update All Read
router.put("/updateAllRead", notificationController.updateAllRead);

// Update by ID
router.put("/:id", notificationController.update);

// Delete by ID
router.delete("/:id", notificationController.delete);

module.exports = router;
