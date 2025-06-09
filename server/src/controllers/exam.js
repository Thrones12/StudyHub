const Exam = require("../models/exam");
const Course = require("../models/course");
const Chapter = require("../models/chapter");

// Get all exams, sorted by order
exports.getAll = async (req, res) => {
    try {
        const exams = await Exam.find()
            .sort({ createdAt: 1 })
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

        if (!exams || exams.length === 0) {
            return res.status(404).json({ message: "No exams found" });
        }

        const formattedExams = exams.map((exam) => ({
            ...exam.toObject(),
            subjectTitle: exam.chapterId?.subjectId?.title || null,
            courseTitle: exam.chapterId?.subjectId?.courseId?.title || null,
            link: `/study//exam${exam._id}`,
        }));

        res.json(formattedExams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one Course by ID
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findById(id)
            .populate({
                path: "chapterId",
                model: "Chapter",
                populate: {
                    path: "subjectId",
                    model: "Subject",
                    populate: {
                        path: "courseId",
                        model: "Course",
                        select: "title", // chỉ lấy title của khóa học
                    },
                    select: "title", // chỉ lấy title của môn học
                },
            })
            .populate({
                path: "questions",
                model: "Question",
                options: { sort: { order: 1 } }, // <- sắp xếp theo order tăng dần
            });
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const formattedExam = {
            ...exam.toObject(),
            subjectTitle: exam.chapterId?.subjectId?.title || null,
            courseTitle: exam.chapterId?.subjectId?.courseId?.title || null,
            link: `/study/exam/${exam._id}`,
        };

        res.json(formattedExam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new exam
exports.create = async (req, res) => {
    try {
        const exam = new Exam(req.body);
        const newExam = await exam.save();
        const chapter = await Chapter.findById(newExam.chapterId);
        chapter.exams.push(newExam._id);
        await chapter.save();
        res.status(201).json(newExam);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a Exam by ID
exports.update = async (req, res) => {
    try {
        const examId = req.params.id;
        const newData = req.body;

        // Lấy dữ liệu exam hiện tại để so sánh chapterId cũ
        const existingExam = await Exam.findById(examId);
        if (!existingExam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const oldChapterId = existingExam.chapterId;
        const newChapterId = newData.chapterId;

        // Cập nhật exam
        const updatedExam = await Exam.findByIdAndUpdate(examId, newData, {
            new: true,
        });
        // Nếu chapterId thay đổi
        if (oldChapterId !== newChapterId) {
            // Xóa exam khỏi chapter cũ
            await Chapter.findByIdAndUpdate(oldChapterId, {
                $pull: { exams: examId },
            });

            // Thêm exam vào chapter mới
            await Chapter.findByIdAndUpdate(newChapterId, {
                $addToSet: { exams: examId },
            });
        }

        res.json(updatedExam);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

// Đánh giá
exports.rate = async (req, res) => {
    try {
        const { examId, userId, rate } = req.body;
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json("Data Not Found");

        // Kiểm tra người dùng đã đánh giá chưa
        const existingRateIndex = exam.rating.details.findIndex(
            (item) => item.userId.toString() === userId
        );
        if (existingRateIndex !== -1) {
            // Cập nhật đánh giá cũ
            exam.rating.details[existingRateIndex].rate = rate;
        } else {
            // Thêm mới đánh giá
            exam.rating.details.push({ userId, rate });
        }

        // Tính điểm trung bình (overall)
        const total = exam.rating.details.reduce(
            (sum, item) => sum + item.rate,
            0
        );
        const average = total / exam.rating.details.length;

        exam.rating.overall = Math.round(average * 10) / 10; // làm tròn 1 chữ số thập phân

        const updatedExam = await exam.save();

        res.json(updatedExam);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};

// Delete a Exam by ID
exports.delete = async (req, res) => {
    try {
        const deletedExam = await Exam.findByIdAndDelete(req.params.id);
        if (!deletedExam)
            return res.status(404).json({ message: "Exam not found" });
        res.json({ message: "Exam deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
