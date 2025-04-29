let express = require("express");
let router = express.Router();
let controller = require("../controllers/sound");

router.get("/", controller.GetData);

module.exports = router;
