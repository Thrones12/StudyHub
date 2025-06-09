const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam");

// Get all
router.get("/", examController.getAll);

// Get one by ID
router.get("/:id", examController.getOne);

// Create
router.post("/", examController.create);

// Đánh giá
router.put("/rate", examController.rate);

// Update by ID
router.put("/:id", examController.update);

// Delete by ID
router.delete("/:id", examController.delete);

module.exports = router;
