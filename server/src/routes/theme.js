const express = require("express");
const router = express.Router();
const themeController = require("../controllers/theme");

// Get all
router.get("/", themeController.getAll);

// Get one by ID
router.get("/:id", themeController.getOne);

// Create
router.post("/", themeController.create);

// Update by ID
router.put("/:id", themeController.update);

// Delete by ID
router.delete("/:id", themeController.delete);

module.exports = router;
