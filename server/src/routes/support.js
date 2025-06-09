const express = require("express");
const router = express.Router();
const supportController = require("../controllers/support");

// Get all
router.get("/", supportController.getAll);

// Get tất cả câu hỏi hỗ trợ được phép hiển thị
router.get("/show", supportController.getAllShow);

// Get one by ID
router.get("/:id", supportController.getOne);

// Create
router.post("/", supportController.create);

// Update by ID
router.put("/:id", supportController.update);

// Delete by ID
router.delete("/:id", supportController.delete);

module.exports = router;
