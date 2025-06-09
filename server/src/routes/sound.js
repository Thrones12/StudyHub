const express = require("express");
const router = express.Router();
const soundController = require("../controllers/sound");

// Get all
router.get("/", soundController.getAll);

// Get one by ID
router.get("/:id", soundController.getOne);

// Create
router.post("/", soundController.create);

// Update by ID
router.put("/:id", soundController.update);

// Delete by ID
router.delete("/:id", soundController.delete);

module.exports = router;
