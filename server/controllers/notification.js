const Notification = require("../models/notification");
const User = require("../models/user");

// GET /notification?userId=...
const GetAll = async (req, res) => {
    try {
        const { userId, page, limit } = req.query;
        let data; // Dữ liệu return

        // Hỗ trợ phân trang
        let skip = 0;
        if (page) skip = page * limit;

        // Get dữ liệu
        if (userId) {
            data = await Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit || 20);
        } else {
            data = await Notification.find({});
        }

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not found" });

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// GET /notification/get-one?id=.....
const GetOne = async (req, res) => {
    try {
        const { id } = req.query;
        let data; // Dữ liệu trả về

        // Get dữ liệu
        if (id) {
            data = await Notification.findById(id);
        }

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not found" });

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// POST /notification
const Create = async (req, res) => {
    try {
        const { userId, type, content, link } = req.body;

        // Create new doc
        const newData = new Notification({ userId, type, content, link });
        newData.save();

        // Add Notification vào User
        const user = await User.findById(userId);
        user.notifications.push(newData._id.toString());
        user.save();

        // 200 - Success
        return res.status(200).json({ data: newData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// PUT /notification
const Update = async (req, res) => {
    try {
        const { id, type, content, link, isRead, isShow } = req.body;

        // Tìm doc
        const existingData = await Notification.findById(id);

        // 404 - Not Found
        if (!existingData)
            return res.status(404).json({ message: "Not Found" });

        // Update dữ liệu
        if (type) existingData.type = type;
        if (content) existingData.content = content;
        if (link) existingData.link = link;
        if (isRead) existingData.isRead = isRead;
        if (isShow) existingData.isShow = isShow;
        await existingData.save();

        // 200 - Success
        return res.status(200).json({ data: existingData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// PUT /notification/hide?id=...
const HideNotification = async (req, res) => {
    try {
        const { id } = req.query;

        // Tìm doc
        const existingData = await Notification.findById(id);

        // 404 - Not Found
        if (!existingData)
            return res.status(404).json({ message: "Not Found" });

        // Update dữ liệu
        existingData.isShow = false;
        await existingData.save();

        // 200 - Success
        return res.status(200).json({ data: existingData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// PUT /notification/show?id=...
const ShowNotification = async (req, res) => {
    try {
        const { id } = req.query;

        // Tìm doc
        const existingData = await Notification.findById(id);

        // 404 - Not Found
        if (!existingData)
            return res.status(404).json({ message: "Not Found" });

        // Update dữ liệu
        existingData.isShow = true;
        await existingData.save();

        // 200 - Success
        return res.status(200).json({ data: existingData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};

// PUT /notification/read
const ReadNotification = async (req, res) => {
    try {
        const { ids } = req.body;
        console.log(ids);

        // 400 - Invalid
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Invalid" });
        }

        // Cập nhật
        const result = await Notification.updateMany(
            { _id: { $in: ids } },
            { $set: { isRead: true } }
        );

        // 200 - Success
        return res.status(200).json({ data: result });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// DELETE /notification?id=...
const Delete = async (req, res) => {
    try {
        const { id } = req.query;

        // Tìm và xóa dữ liệu
        const data = await Notification.findByIdAndDelete(id);

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not Found" });

        // Xóa notification trong user
        {
            const user = await User.findById(data.userId);
            // 404 - Not Found
            if (!user) return res.status(404).json({ message: "Not Found" });
            // Xóa bằng filter
            user.notifications = user.notifications.filter(
                (n) => n.toString() !== id
            );

            await user.save();
        }

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};

module.exports = {
    GetAll,
    GetOne,
    Create,
    Update,
    HideNotification,
    ShowNotification,
    ReadNotification,
    Delete,
};
