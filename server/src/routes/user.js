const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

// Get all
router.get("/", userController.getAll);

// Get one by ID
router.get("/:id", userController.getOne);

// Create
router.post("/", userController.create);

// Update by ID
router.put("/:id", userController.update);

// Delete by ID
router.delete("/:id", userController.delete);

module.exports = router;
