const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course");
const verifyToken = require("../middlewares/authMiddleware");

// Get all
router.get("/", courseController.getAll);

// Get one by ID
router.get("/:id", courseController.getOne);

// Create
router.post("/", courseController.create);

// Update by ID
router.put("/:id", courseController.update);

// Delete by ID
router.delete("/:id", courseController.delete);

module.exports = router;
