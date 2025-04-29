let express = require("express");
let router = express.Router();
let controller = require("../controllers/exam");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);
router.get("/get-title", controller.GetTitleOfCourseAndSubject);
router.post("/", controller.Create);

module.exports = router;
