const Notification = require("../models/notification");
const User = require("../models/user");

// Get all notifications, sorted by order
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.body;

        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const notifications = user.notifications.sort(
                (a, b) => b.createdAt - a.createdAt
            );

            if (!notifications || notifications.length === 0) {
                return res
                    .status(404)
                    .json({ message: "No notifications found" });
            }

            return res.json(notifications);
        }
        const notifications = await Notification.find().sort({ createdAt: -1 }); // 1 = cũ -> mới, -1 = mới -> cũ

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found" });
        }

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one notification by ID
exports.getOne = async (req, res) => {
    try {
        const notification = await notification.findById(req.params.id);
        if (!notification)
            return res.status(404).json({ message: "notification not found" });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new notification
exports.create = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        const newNotification = await notification.save();

        if (!req.body.userId) {
            // Gửi đến toàn bộ người dùng
            const allUsers = await User.find();

            for (const user of allUsers) {
                user.notifications.push(newNotification._id);
                await user.save(); // nếu quá nhiều user, nên dùng bulkWrite để tối ưu
            }
        } else {
            // Gửi cho 1 user cụ thể
            const user = await User.findById(req.body.userId);
            if (user) {
                user.notifications.push(newNotification._id);
                await user.save();
            }
        }

        res.status(201).json(newNotification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a notification by ID
exports.update = async (req, res) => {
    try {
        const updatednotification = await notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatednotification)
            return res.status(404).json({ message: "notification not found" });
        res.json(updatednotification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a notification by ID
exports.delete = async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(
            req.params.id
        );
        if (!deletedNotification)
            return res.status(404).json({ message: "Notification not found" });

        if (!deletedNotification.userId) {
            // Xóa thông báo trong toàn bộ người dùng
            const allUsers = await User.find();

            for (const user of allUsers) {
                user.notifications = user.notifications.filter(
                    (noti) =>
                        noti.toString() !== deletedNotification._id.toString()
                );
                await user.save();
            }
        } else {
            // Gửi cho 1 user cụ thể
            const user = await User.findById(deletedNotification.userId);
            if (user) {
                user.notifications = user.notifications.filter(
                    (noti) =>
                        noti.toString() !== deletedNotification._id.toString()
                );
                await user.save();
            }
        }

        res.status(201).json(deletedNotification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
