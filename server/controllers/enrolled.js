const enrolled = require("../models/enrolled");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await enrolled.findById(id);
    } else {
        data = await enrolled
            .find({})
            .populate({ model: "Subject", path: "subject" })
            .populate({ model: "Lesson", path: "lessons" });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "enrolled not found" });

    res.json(data);
};
module.exports = {
    GetData,
};
