const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject");

// Get all
router.get("/", subjectController.getAll);

// Get one by ID
router.get("/:id", subjectController.getOne);

// Create
router.post("/", subjectController.create);

// Update by ID
router.put("/:id", subjectController.update);

// Delete by ID
router.delete("/:id", subjectController.delete);

module.exports = router;
