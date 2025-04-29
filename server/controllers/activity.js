const Activity = require("../models/activity");
const User = require("../models/user");

// GET /activity?userId=...
const GetAll = async (req, res) => {
    try {
        // Query truyền vào
        const { userId } = req.query;
        let data; // Dữ liệu return

        // Get dữ liệu
        if (userId) {
            let tempData = await User.findById(userId).populate({
                path: "histories",
                model: "Activity",
            });
            data = tempData.histories;
        } else {
            data = await Activity.find({});
        }

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Data not found" });

        // Return dữ liệu
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// GET /activity/get-one?id=.....
const GetOne = async (req, res) => {
    try {
        // Query truyền vào
        const { id } = req.query;
        let data; // Dữ liệu trả về

        // Get dữ liệu
        if (id) {
            data = await Activity.findById(id);
        }

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Data not found" });

        // Return dữ liệu
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// POST /activity
const Create = async (req, res) => {
    try {
        // Body truyền vào
        const { userId, type, title } = req.body;

        // Tạo và lưu doc mới
        const newData = new Activity({ type, title });
        newData.save();

        // Thêm activity vào user
        const user = await User.findById(userId);
        user.histories.push(newData._id.toString());
        user.save();

        // Return dữ liệu
        return res.status(200).json({ data: newData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};

// Update
// _id: quan trọng, dùng để tìm doc update
// input: type, message
const Update = async (req, res) => {
    try {
        const { _id, type, message } = req.body;

        const existingData = await Activity.findById(_id);

        if (!existingData)
            return res
                .status(404)
                .json({ data: [], message: "Không tìm thấy dữ liệu" });

        if (type) existingData.type = type;
        if (message) existingData.message = message;

        await existingData.save();

        return res
            .status(200)
            .json({ data: existingData, message: "Update thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// Delete, truyền id vào query để xóa, ex: http:192.168.1.3:8080/api/course?id=.....
const Delete = async (req, res) => {
    try {
        const { id } = req.query; // Lấy id từ query string

        const deletedData = await Activity.findByIdAndDelete(id);

        if (!deletedData) {
            return res
                .status(404)
                .json({ data: [], message: "Không tìm thấy dữ liệu" });
        }

        return res
            .status(200)
            .json({ data: deletedData, message: "Xóa thành công" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

module.exports = {
    GetAll,
    GetOne,
    Create,
    Update,
    Delete,
};
