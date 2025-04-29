let express = require("express");
let router = express.Router();
let controller = require("../controllers/task");

router.get("/", controller.GetAll);
router.get("/get-one", controller.GetOne);
router.post("/", controller.Create);
router.put("/", controller.Update);
router.delete("/", controller.Delete);

module.exports = router;
