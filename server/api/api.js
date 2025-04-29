let express = require("express");
let router = express.Router();

let activity = require("../routers/activity");
router.use("/api/activity", activity);

let chapter = require("../routers/chapter");
router.use("/api/chapter", chapter);

let course = require("../routers/course");
router.use("/api/course", course);

let discuss = require("../routers/discuss");
router.use("/api/discuss", discuss);

let exam = require("../routers/exam");
router.use("/api/exam", exam);

let examResult = require("../routers/examResult");
router.use("/api/examResult", examResult);

let exercise = require("../routers/exercise");
router.use("/api/exercise", exercise);

let exerciseType = require("../routers/exerciseType");
router.use("/api/exerciseType", exerciseType);

let lesson = require("../routers/lesson");
router.use("/api/lesson", lesson);

let notification = require("../routers/notification");
router.use("/api/notification", notification);

let sound = require("../routers/sound");
router.use("/api/sound", sound);

let storage = require("../routers/storage");
router.use("/api/storage", storage);

let subject = require("../routers/subject");
router.use("/api/subject", subject);

let task = require("../routers/task");
router.use("/api/task", task);

let user = require("../routers/user");
router.use("/api/user", user);

module.exports = router;
