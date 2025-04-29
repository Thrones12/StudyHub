const exercise = require("../models/exercise");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id, exerciseTypeId } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await exercise.findById(id);
    } else if (exerciseTypeId) {
        data = await exercise.find({ exerciseType: exerciseTypeId });
    } else {
        data = await exercise.find({});
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "exercise not found" });

    res.json(data);
};

module.exports = {
    GetData,
};
