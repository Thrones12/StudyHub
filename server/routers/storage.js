let express = require("express");
let router = express.Router();
let controller = require("../controllers/storage");

router.get("/", controller.GetAll);
router.get("/get-one", controller.GetOne);
router.get("/get-item", controller.GetItem);
router.post("/", controller.Create);
router.delete("/", controller.Delete);
router.delete("/delete-item", controller.DeleteItem);
router.put("/save", controller.Save);
router.put("/un-save", controller.Unsave);

module.exports = router;
