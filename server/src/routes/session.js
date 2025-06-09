const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session");

// Get all
router.get("/", sessionController.getAll);

// Get one by ID
router.get("/:id", sessionController.getOne);

// Create
router.post("/", sessionController.create);

// Update by ID
router.put("/", sessionController.update);

// Delete by ID
router.delete("/:id", sessionController.delete);

module.exports = router;
