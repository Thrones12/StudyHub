let express = require("express");
let router = express.Router();
let controller = require("../controllers/exercise");

router.get("/", controller.GetData);

module.exports = router;
