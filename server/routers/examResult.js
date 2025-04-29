let express = require("express");
let router = express.Router();
let controller = require("../controllers/examResult");

router.get("/", controller.GetData);
router.get("/get-one", controller.GetOne);
router.post("/", controller.Create);

module.exports = router;
