let express = require("express");
let router = express.Router();
let controller = require("../controllers/examResult");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);
// Lấy dữ liệu xếp hạng
router.get("/rank/:examId", controller.GetRank);

// Tạo 1 exam result mới
router.post("/", controller.Create);

module.exports = router;
