const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");

// Get all
router.get("/", commentController.getAll);

// Get one by ID
router.get("/:id", commentController.getOne);

// Create
router.post("/", commentController.create);

// Xử lý yêu thích bài học
router.put("/like", commentController.likeLesson);

// Update by ID
router.put("/", commentController.update);

// Delete by ID
router.delete("/:id", commentController.delete);

module.exports = router;
