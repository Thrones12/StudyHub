const express = require("express");
const upload = require("../middlewares/upload"); // middleware multer
const router = express.Router();
const userController = require("../controllers/user");

// Get all
router.get("/", userController.getAll);

// Get bài học đã hoàn thành
router.get("/done", userController.getDoneLessonsByUser);

router.get("/get-learning-hour", userController.getLearningHour);
router.get("/get-progress", userController.getProgress);
router.get("/get-average-score", userController.getAverageScore);

// Get bài kiểm tra đã lưu trữ
router.get("/save", userController.getSavesByUser);

// Get bài học đã yêu thích
router.get("/like", userController.getLikesByUser);

// Get one by ID
router.get("/:id", userController.getOne);

// Get lịch sử tìm kiếm
router.get("/search/:id", userController.getSearch);

router.post("/history", userController.addHistory);

router.post("/check-learning-hour", userController.checkLearningHour);
// Create
router.post("/", upload.single("image"), userController.create);

// Thêm lịch sử tìm kiếm
router.post("/search/:id", userController.addSearch);

// Delete image of custom theme
router.post("/theme", userController.deleteImageOfTheme);

// Add new image to custom theme
router.put("/theme", upload.single("image"), userController.addImageToTheme);

// Update email
router.put("/log-time", userController.logTime);

// Update email
router.put("/email", userController.updateEmail);

// Update mật khẩu
router.put("/password", userController.updatePassword);

// Lưu trữ / hủy lưu trữ bài kiểm tra
router.put("/save", userController.saveExam);

// Yêu thích / hủy yêu thích bài học
router.put("/like", userController.likeLesson);

// Xử lý hoàn thành bài học
router.put("/learned", userController.learnedLesson);

// Update hồ sơ
router.put(
    "/profile/:id",
    upload.single("image"),
    userController.updateProfile
);

// Update user
router.put("/", upload.single("image"), userController.update);
// Delete by ID
router.delete("/:id", userController.delete);

module.exports = router;
