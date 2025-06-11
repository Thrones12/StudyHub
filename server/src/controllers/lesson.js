const Lesson = require("../models/lesson");
const Chapter = require("../models/chapter");

// Get all lessons, sorted by order
exports.getAll = async (req, res) => {
    try {
        const lessons = await Lesson.find()
            .sort({ order: 1 }) // 1 = tăng dần, -1 = giảm dần
            .populate({
                path: "chapterId",
                model: "Chapter",
                populate: {
                    path: "subjectId",
                    model: "Subject",
                    populate: {
                        path: "courseId",
                        model: "Course",
                        select: "title", // chỉ lấy course title
                    },
                    select: "title", // chỉ lấy subject title
                },
            });

        if (!lessons || lessons.length === 0) {
            return res.status(404).json({ message: "No lessons found" });
        }
        const formattedLessons = lessons.map((lesson) => ({
            ...lesson.toObject(),
            subjectTitle: lesson.chapterId?.subjectId?.title || null,
            courseTitle: lesson.chapterId?.subjectId?.courseId?.title || null,
            link: `/lesson${lesson._id}`,
        }));
        res.json(formattedLessons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one lesson by ID
exports.getOne = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate({
                path: "rating.details.userId",
                model: "User",
                select: "profile.fullname profile.avatarUrl",
            })
            .populate({ path: "exercises.questions", model: "Question" });
        if (!lesson)
            return res.status(404).json({ message: "lesson not found" });
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new lesson
exports.create = async (req, res) => {
    try {
        const lesson = new Lesson(req.body);
        const newLesson = await lesson.save();
        if (req.body.chapterId) {
            let chapter = await Chapter.findById(req.body.chapterId);
            chapter.lessons.push(newLesson._id);
            await chapter.save();
        }
        res.status(201).json(newLesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a lesson by ID
exports.update = async (req, res) => {
    try {
        const updatedlesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedlesson)
            return res.status(404).json({ message: "lesson not found" });
        res.json(updatedlesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Đánh giá
exports.rate = async (req, res) => {
    try {
        const { lessonId, userId, rate, content } = req.body;
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json("Data Not Found");

        // Kiểm tra người dùng đã đánh giá chưa
        const existingRateIndex = lesson.rating.details.findIndex(
            (item) => item.userId.toString() === userId
        );
        if (existingRateIndex !== -1) {
            // Cập nhật đánh giá cũ
            lesson.rating.details[existingRateIndex].rate = rate;
            lesson.rating.details[existingRateIndex].content = content;
        } else {
            // Thêm mới đánh giá
            lesson.rating.details.push({ userId, rate, content });
        }

        // Tính điểm trung bình (overall)
        const total = lesson.rating.details.reduce(
            (sum, item) => sum + item.rate,
            0
        );
        const average = total / lesson.rating.details.length;

        lesson.rating.overall = Math.round(average * 10) / 10; // làm tròn 1 chữ số thập phân

        const updatedLesson = await lesson.save();

        res.json(updatedLesson);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};

// Xóa đánh giá
exports.deleteRate = async (req, res) => {
    try {
        const { lessonId, userId } = req.body;

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json("Data Not Found");

        // Tìm vị trí đánh giá của user
        const existingRateIndex = lesson.rating.details.findIndex(
            (item) => item.userId.toString() === userId
        );

        if (existingRateIndex === -1) {
            return res.status(404).json("Rating not found for this user");
        }

        // Xóa đánh giá
        lesson.rating.details.splice(existingRateIndex, 1);

        // Tính lại điểm trung bình
        if (lesson.rating.details.length > 0) {
            const total = lesson.rating.details.reduce(
                (sum, item) => sum + item.rate,
                0
            );
            const average = total / lesson.rating.details.length;
            lesson.rating.overall = Math.round(average * 10) / 10;
        } else {
            // Nếu không còn đánh giá nào
            lesson.rating.overall = 0;
        }

        const updatedLesson = await lesson.save();
        res.json(updatedLesson);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

// Delete a lesson by ID
exports.delete = async (req, res) => {
    try {
        const deletedlesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!deletedlesson)
            return res.status(404).json({ message: "lesson not found" });
        res.json({ message: "lesson deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
