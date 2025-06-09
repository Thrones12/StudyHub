const ExamResult = require("../models/examResult");
const Exam = require("../models/exam");
const User = require("../models/user");
const Subject = require("../models/subject");

exports.GetData = async (req, res) => {
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
exports.GetOne = async (req, res) => {
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

// Lấy dữ liệu xếp hạng
exports.GetRank = async (req, res) => {
    try {
        const { examId } = req.params;

        // Lấy tất cả kết quả của bài thi
        let results = await ExamResult.find({ exam: examId }).populate({
            path: "user",
            model: "User",
        });

        // Sắp xếp: điểm cao hơn đứng trước, nếu bằng thì thời gian nhỏ hơn đứng trước
        results.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // sắp theo score giảm dần
            } else {
                return a.duration - b.duration; // nếu bằng thì sắp theo duration tăng dần
            }
        });

        // Thêm thứ hạng vào từng kết quả
        results = results.map((item, index) => ({
            userId: item.user._id,
            name: item.user.profile.fullname,
            score: item.score,
            duration: item.duration,
        }));

        return res.status(200).json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

exports.Create = async (req, res) => {
    try {
        const { user, exam, score, duration, answers, chapterId } = req.body;

        let trueCount = 0;
        let falseCount = 0;
        let notDoneCount = 0;

        const formattedAnswers = answers.map((answer) => {
            const { question, input, state } = answer;

            // Đếm trạng thái
            if (state === "true") trueCount++;
            else if (state === "false") falseCount++;
            else if (state === "not_done") notDoneCount++;

            return {
                question,
                selectOption: input,
                isCorrect: state === "true",
            };
        });

        let existingResult = await ExamResult.findOne({ user, exam });
        let result = null;

        if (existingResult) {
            const isBetterScore =
                existingResult.score < score ||
                (existingResult.score === score &&
                    duration < existingResult.duration);

            if (isBetterScore) {
                // Cập nhật kết quả tốt hơn
                existingResult.score = score;
                existingResult.duration = duration;
                existingResult.trueCount = trueCount;
                existingResult.falseCount = falseCount;
                existingResult.notDoneCount = notDoneCount;
                existingResult.answers = formattedAnswers;
                await existingResult.save();
                result = existingResult;
            } else {
                // Không lưu, chỉ trả về kết quả mới để hiển thị
                result = {
                    _id: null,
                    user,
                    exam,
                    score,
                    duration,
                    trueCount,
                    falseCount,
                    notDoneCount,
                    answers: formattedAnswers,
                };
            }
        } else {
            console.log(chapterId);

            const newResult = new ExamResult({
                user,
                exam,
                score,
                duration,
                trueCount,
                falseCount,
                notDoneCount,
                chapterId,
                answers: formattedAnswers,
            });

            await newResult.save();
            const userDoc = await User.findById(user);
            if (userDoc) {
                userDoc.examResults.push(newResult._id);
                await userDoc.save();
            }
            result = newResult;
        }

        // Cập nhập lại dữ liệu trong exam
        {
            const existingExam = await Exam.findById(exam);
            if (!existingExam)
                return res.status(404).json("Dữ liệu không tồn tại");

            // Tăng số lượt làm
            existingExam.attemps += 1;

            // Cập nhập điểm số
            const results = await ExamResult.find({ exam });

            if (results.length > 0) {
                const totalScore = results.reduce(
                    (sum, item) => sum + item.score,
                    0
                );
                const averageScore = totalScore / results.length;

                // Cập nhật điểm trung bình
                existingExam.averageScore = parseFloat(averageScore.toFixed(1));
            } else {
                // Nếu chưa có kết quả nào, để là 0
                existingExam.averageScore = 0;
            }
            await existingExam.save();
        }

        res.status(200).json(result);
    } catch (err) {
        console.log(err);

        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
