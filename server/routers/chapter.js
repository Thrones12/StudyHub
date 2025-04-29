let express = require("express");
let router = express.Router();
let controller = require("../controllers/chapter");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);
router.get("/exam", controller.GetExam);

module.exports = router;
