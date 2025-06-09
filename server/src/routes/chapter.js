const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter");

// Get all
router.get("/", chapterController.getAll);

// Get one by ID
router.get("/:id", chapterController.getOne);

// Create
router.post("/", chapterController.create);

// Update by ID
router.put("/:id", chapterController.update);

// Delete by ID
router.delete("/:id", chapterController.delete);

module.exports = router;
