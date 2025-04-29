let express = require("express");
let router = express.Router();
let controller = require("../controllers/discuss");

router.get("/", controller.GetData);
router.post("/", controller.Create);
router.put("/:id/like", controller.Like);
router.put("/:id/unlike", controller.Unlike);

module.exports = router;
