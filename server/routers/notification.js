let express = require("express");
let router = express.Router();
let controller = require("../controllers/notification");

router.get("/", controller.GetAll);
router.get("/get-one", controller.GetOne);
router.post("/", controller.Create);
router.put("/", controller.Update);
router.put("/hide", controller.HideNotification);
router.put("/show", controller.ShowNotification);
router.put("/read", controller.ReadNotification);
router.delete("/", controller.Delete);

module.exports = router;
