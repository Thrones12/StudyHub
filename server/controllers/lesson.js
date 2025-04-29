const Lesson = require("../models/lesson");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id, subjectId } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Lesson.findById(id);
    } else if (subjectId) {
        data = await Lesson.find({ subject: subjectId });
    } else {
        data = await Lesson.find({})
            .populate({ model: "ExerciseType", path: "exerciseTypes" })
            .populate({ model: "Discuss", path: "discussions" });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Lesson not found" });

    res.json(data);
};

const GetOne = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get
    console.log(id);

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Lesson.findOne({ _id: id })
            .populate({
                model: "ExerciseType",
                path: "exerciseTypes",
                populate: { model: "Exercise", path: "exercises" },
            })
            .populate({
                model: "Discuss",
                path: "discussions",
                populate: [
                    { model: "User", path: "user" },
                    { model: "User", path: "likes" },
                ],
            });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "subject not found" });

    return res.status(200).json({ data: data, message: "Get one thành công" });
};

module.exports = {
    GetData,
    GetOne,
};
