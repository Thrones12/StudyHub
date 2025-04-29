const Sound = require("../models/sound");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id, subjectId } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Sound.findById(id);
    } else if (subjectId) {
        data = await Sound.find({ subject: subjectId });
    } else {
        data = await Sound.find({});
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "sound not found" });

    res.json(data);
};
module.exports = {
    GetData,
};
