const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson");

// Get all
router.get("/", lessonController.getAll);

// Get one by ID
router.get("/:id", lessonController.getOne);

// Create
router.post("/", lessonController.create);

// Đánh giá
router.put("/rate", lessonController.rate);

// Xóa đánh giá
router.put("/delete-rate", lessonController.deleteRate);

// Update by ID
router.put("/:id", lessonController.update);

// Delete by ID
router.delete("/:id", lessonController.delete);

module.exports = router;
