const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question");

// Get all
router.get("/", questionController.getAll);

// Get one by ID
router.get("/:id", questionController.getOne);

// Create
router.post("/", questionController.create);

// Update by ID
router.put("/:id", questionController.update);

// Delete by ID
router.delete("/:id", questionController.delete);

module.exports = router;
