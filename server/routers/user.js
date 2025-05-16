let express = require("express");
let router = express.Router();
let controller = require("../controllers/user");
let { upload } = require("../config/MulterConfig");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);
router.get("/get-storages", controller.GetStorage);
router.get("/get-learning-hour", controller.GetLearningHour);
router.get("/get-progress", controller.GetProgress);
router.get("/get-average-score", controller.GetAverageScore);
router.get("/verify-token", controller.VerifyToken);

router.post("/", controller.Create);
router.post("/login", controller.Login);
router.post("/register", controller.Register);
router.post("/send-otp", controller.SendOTP);
router.post("/send-password", controller.SendPassword);
router.post("/verify", controller.Verify);
router.post("/check-learning-hour", controller.CheckLearningHour);

router.put("/", upload.single("file"), controller.Update);
router.put("/email", controller.UpdateEmail);
router.put("/password", controller.UpdatePassword);
router.put("/lesson-done", controller.SetLessonDone);

module.exports = router;
