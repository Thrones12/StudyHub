const Exam = require("../models/exam");
const Course = require("../models/course");
const Subject = require("../models/subject");
const Chapter = require("../models/chapter");

const GetData = async (req, res) => {
    try {
        const {
            course, // tag của course
            subject, // tag của subject
            level,
            sort, // mặc định là mới nhất
            page = 1,
            limit = 20,
        } = req.query;

        let query = {};

        // Lọc theo course
        if (course && course !== "all") {
            query.courseTag = course;
        }

        // Lọc theo subject
        if (subject && subject !== "all") {
            query.subjectTag = subject;
        }

        // Lọc theo level
        if (level && ["easy", "medium", "hard"].includes(level)) {
            query.level = level;
        }

        // Ánh xạ các giá trị sortOption thành field trong database
        let sortOption = {};
        switch (sort) {
            case "best":
                // Tốt nhất: ưu tiên attempt + save + completion
                sortOption = {
                    completionCount: -1,
                    attemptCount: -1,
                    saveCount: -1,
                };
                break;
            case "attempt":
                sortOption = { attemptCount: -1 };
                break;
            case "save":
                sortOption = { saveCount: -1 };
                break;
            case "new":
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Tìm tất cả bài kiểm tra (exams) với các filter đã được thêm
        const exams = await Exam.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Exam.countDocuments(query);

        if (!exams || exams.length === 0) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy bài kiểm tra nào" });
        }

        return res.status(200).json({
            data: exams,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (err) {
        console.error("Error when fetching exams:", err);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

const GetOne = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;
    console.log(id);

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Exam.findOne({ _id: id }).populate({
            model: "Exercise",
            path: "questions",
        });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Exam not found" });

    return res.status(200).json({ data });
};
// GET /exam/get-title
const GetTitleOfCourseAndSubject = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    const courses = await Course.find({}).populate({
        path: "subjects",
        model: "Subject",
        populate: {
            path: "chapters",
            model: "Chapter",
            populate: { path: "exams", model: "Exam" },
        },
    });

    if (!courses) {
        return res
            .status(404)
            .json({ message: "Exam not found in any course" });
    }

    for (const course of courses) {
        for (const subject of course.subjects) {
            for (const chapter of subject.chapters) {
                const exam = chapter.exams.find((e) => e._id.toString() === id);
                if (exam) {
                    data = {
                        courseTitle: course.title,
                        subjectTitle: subject.title,
                    };
                    break;
                }
            }
            if (data) break;
        }
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Exam not found" });

    return res.status(200).json({ data, message: "Get thành công" });
};
// POST /exam

const Create = async (req, res) => {
    try {
        const { title, questions, duration, level, chapterId } = req.body;

        const newData = new Exam({
            title,
            questions,
            duration,
            level: level ? level : "easy",
        });

        const chapter = await Chapter.findById(chapterId);

        const subjects = await Subject.find({});
        const subject = subjects.find((s) =>
            s.chapters.some((c) => c.toString() === chapterId)
        );

        const courses = await Course.find({});

        const course = courses.find((c) =>
            c.subjects.some((s) => s.toString() === subject._id.toString())
        );

        newData.subjectTag = subject.tag;
        newData.courseTag = course.tag;

        await newData.save();

        chapter.exams.push(newData._id);
        chapter.save();

        res.status(200).json({ message: "Create thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
module.exports = {
    GetData,
    GetOne,
    GetTitleOfCourseAndSubject,
    Create,
};
