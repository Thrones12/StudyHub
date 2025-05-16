const ExamResult = require("../models/examResult");
const User = require("../models/user");
const Subject = require("../models/subject");

const GetData = async (req, res) => {
    let { userId, subjectId } = req.query;
    let data; // Return data

    // Get Data
    if (userId && subjectId) {
        let examResults = await ExamResult.find({ user: userId }).populate({
            model: "Exam",
            path: "exam",
        });
        let subjects = await Subject.findById(subjectId);
        data = examResults.filter((exam) =>
            subjects.chapters.some(
                (chapter) => chapter.toString() === exam.chapterId
            )
        );
    } else {
        data = await ExamResult.find({})
            .populate({ model: "User", path: "user" })
            .populate({ model: "Exam", path: "exam" });
    }

    // 404 - Not Found
    if (!data) return res.status(404).json({ message: "Data not found" });

    // 200 - Success
    return res.status(200).json({ data: data });
};
// GET /examResult/get-one?id=...&examId=...
const GetOne = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id, examId } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await ExamResult.findById(id);
        } else if (examId) {
            data = await ExamResult.findOne({ exam: examId });
            if (!data)
                return res
                    .status(200)
                    .json({ message: "Không có bài kiểm tra" });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get one thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

const Create = async (req, res) => {
    try {
        const { user, exam, chapterId, score, duration, result } = req.body;

        let existingExam = await ExamResult.findOne({ exam: exam });

        if (existingExam) {
            if (
                existingExam.score < score ||
                (existingExam.score <= score &&
                    duration < existingExam.duration)
            ) {
                existingExam.score = score;
                existingExam.duration = duration;
                existingExam.result = result;
                existingExam.submitAt = Date.now();
                existingExam.save();
            }
        } else {
            let data = new ExamResult({
                user,
                exam,
                chapterId,
                score,
                duration,
                result,
            });
            data.save();

            let existingUser = await User.findById(user);

            existingUser.examResults.push(data._id);
            existingUser.save();
        }

        res.status(200).json({
            message: "Tạo kết quả bài kiểm tra thành công",
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
module.exports = {
    GetData,
    GetOne,
    Create,
};
