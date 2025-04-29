const Storage = require("../models/storage");
const User = require("../models/user");
const Lesson = require("../models/lesson");
const Exam = require("../models/exam");
const Exercise = require("../models/exercise");

// GET /user
const GetAll = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { userId } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (userId) {
            let tempData = await User.findById(userId).populate({
                path: "histories",
                model: "Storage",
            });
            data = tempData.histories;
        } else {
            data = await Storage.find({});
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        console.log("Get data: \n" + data);
        return res.status(200).json({ data, message: "Get all success" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// GET /user/get-one?id=
const GetOne = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await Storage.findById(id);
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get one Storage" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// GET /user/get-item?id=
const GetItem = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id } = req.query;

        let storage; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            storage = await Storage.findById(id);
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!storage)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        let data;

        // Dựa vào type để truy xuất đúng model
        if (storage.type === "lesson") {
            data = await Lesson.find({ _id: { $in: storage.items } });
        } else if (storage.type === "exam") {
            data = await Exam.find({ _id: { $in: storage.items } });
        } else if (storage.type === "exercise") {
            data = await Exercise.find({ _id: { $in: storage.items } });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get one Storage" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// POST /storage
const Create = async (req, res) => {
    try {
        const { userId, title, type } = req.body;

        const newData = new Storage({ title, type });
        newData.save();

        const user = await User.findById(userId);
        user.storages.push(newData._id.toString());
        user.save();

        return res
            .status(200)
            .json({ data: newData, message: "Create thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// Update
// _id: quan trọng, dùng để tìm doc update
// input: type, message
const Update = async (req, res) => {
    try {
        const { _id, type, message } = req.body;

        const existingData = await Storage.findById(_id);

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

// PUT /storage/save
const Save = async (req, res) => {
    try {
        const { storageId, itemId } = req.body;

        const existingData = await Storage.findById(storageId);

        if (!existingData)
            return res
                .status(404)
                .json({ data: [], message: "Không tìm thấy dữ liệu" });

        existingData.items.push(itemId);

        await existingData.save();

        return res
            .status(200)
            .json({ data: existingData, message: "Save thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// PUT /storage/un-save
const Unsave = async (req, res) => {
    try {
        const { storageId, itemId } = req.body;

        const existingData = await Storage.findById(storageId);

        if (!existingData)
            return res
                .status(404)
                .json({ data: [], message: "Không tìm thấy dữ liệu" });

        // Loại bỏ item có _id === itemId
        existingData.items = existingData.items.filter(
            (item) => item.toString() !== itemId
        );

        await existingData.save();

        return res
            .status(200)
            .json({ data: existingData, message: "Unsave thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// Delete, truyền id vào query để xóa, ex: http:192.168.1.3:8080/api/course?id=.....
const Delete = async (req, res) => {
    try {
        const { id } = req.query; // Lấy id từ query string

        const deletedData = await Storage.findByIdAndDelete(id);

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

// Delete /storage/delete-item?id= & itemId=
const DeleteItem = async (req, res) => {
    try {
        const { id, itemId } = req.query; // Lấy id từ query string

        const data = await Storage.findById(id);

        if (!data) {
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });
        }

        // Lọc bỏ item có id trùng itemId
        data.items = data.items.filter(
            (item) => item.toString() !== itemId.toString()
        );

        await data.save();

        return res.status(200).json({ data: data, message: "Xóa thành công" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

module.exports = {
    GetAll,
    GetOne,
    GetItem,
    Create,
    Update,
    Delete,
    DeleteItem,
    Save,
    Unsave,
};
