let express = require("express");
let router = express.Router();
let controller = require("../controllers/activity");

router.get("/", controller.GetAll);
router.get("/get-one", controller.GetOne);

module.exports = router;
