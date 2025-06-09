const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo");

// Get all
router.get("/", todoController.getAll);

// Get one by ID
router.get("/:id", todoController.getOne);

// Create
router.post("/", todoController.create);

// Update by ID
router.put("/", todoController.update);

// Delete by ID
router.delete("/", todoController.delete);

module.exports = router;
