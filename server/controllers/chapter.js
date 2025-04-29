const Chapter = require("../models/chapter");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id, subjectId } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Chapter.findById(id);
    } else if (subjectId) {
        data = await Chapter.find({ subject: subjectId })
            .populate({ model: "Lesson", path: "lessons" })
            .populate({ model: "Exam", path: "exams" });
    } else {
        data = await Chapter.find({})
            .populate({ model: "Lesson", path: "lessons" })
            .populate({ model: "Exam", path: "exams" });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Chapter not found" });

    res.json(data);
};

// GET /chapter/get-one?id=...
const GetOne = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await Chapter.findById(id).populate({
                path: "exams",
                model: "Exam",
                populate: { path: "questions", model: "Exercise" },
            });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get one activity" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

const GetExam = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Chapter.findOne({ _id: id }).populate({
            model: "Exam",
            path: "exams",
            populate: { model: "Exercise", path: "questions" },
        });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "subject not found" });

    return res.status(200).json(data.exams);
};
module.exports = {
    GetData,
    GetOne,
    GetExam,
};
