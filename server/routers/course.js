let express = require("express");
let router = express.Router();
let controller = require("../controllers/course");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);

module.exports = router;
