const Notification = require("../models/notification");
const User = require("../models/user");
const { link } = require("../routes/notification");

// Get all notifications, sorted by order
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.query;

        if (userId) {
            const user = await User.findById(userId).populate({
                path: "notifications",
                model: "Notification",
            });
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

// Thêm nhắc nhở công việc cho người dùng
exports.reminder = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId)
            .populate({ path: "todos", model: "Todo" })
            .populate({ path: "notifications", model: "Notification" });
        if (!user) return res.status(404).json({ message: "Not Found" });

        // Lấy tất cả tasks từ user.todos
        const tasks = user.todos.reduce((all, todo) => {
            return all.concat(todo.tasks || []);
        }, []);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // bỏ phần giờ phút giây
        // Lọc ra các task hợp lệ trong ngày hôm nay
        const validTasks = tasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            const endDate = task.endDate ? new Date(task.endDate) : null;
            if (endDate) endDate.setHours(0, 0, 0, 0);

            if (task.repeat && task.repeat !== "none") {
                switch (task.repeat) {
                    case "daily":
                        return today >= dueDate;

                    case "weekly":
                        return (
                            today >= dueDate &&
                            today.getDay() === dueDate.getDay()
                        );

                    case "monthly":
                        return (
                            today >= dueDate &&
                            today.getDate() === dueDate.getDate()
                        );

                    case "yearly":
                        return (
                            today >= dueDate &&
                            today.getDate() === dueDate.getDate() &&
                            today.getMonth() === dueDate.getMonth()
                        );

                    default:
                        return false;
                }
            }

            // Nếu không lặp lại thì chỉ hợp lệ nếu today nằm giữa dueDate và endDate
            if (endDate) {
                return today >= dueDate && today <= endDate;
            }

            // Nếu không có endDate, chỉ kiểm tra today === dueDate
            return today.getTime() === dueDate.getTime();
        });

        if (validTasks.length === 0) {
            return res
                .status(200)
                .json({ message: "Không có công việc cần nhắc hôm nay" });
        }

        // Kiểm tra user.notifications đã có Reminder hôm nay chưa
        const alreadyNotified = user.notifications.some((noti) => {
            const created = new Date(noti.createdAt);
            created.setHours(0, 0, 0, 0);
            return (
                noti.type === "Reminder" &&
                created.getTime() === today.getTime()
            );
        });
        console.log("Already notified:", alreadyNotified);

        if (alreadyNotified) {
            return res.status(200).json({ message: "Đã có nhắc nhở hôm nay" });
        }

        // Tạo thông báo mới
        const newNotification = {
            userId: user._id,
            type: "Reminder",
            content: `Bạn có ${validTasks.length} công việc trong kế hoạch học tập hôm nay!`,
            link: "/task",
        };
        const notification = new Notification(newNotification);
        const savedNotification = await notification.save();

        user.notifications.push(savedNotification._id);
        await user.save();

        return res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Thêm thông báo hệ thống đến toàn bộ người dùng
exports.notiToAll = async (req, res) => {
    try {
        const { type, content } = req.body;
        const users = await User.find();

        // Thêm thông báo vào từng người dùng
        const updatePromises = users.map(async (user) => {
            // Tạo 1 thông báo System mới
            const newNoti = new Notification({ type, content });
            await newNoti.save(); // Lấy tất cả người dùng

            user.notifications.push(newNoti._id);
            return user.save();
        });

        await Promise.all(updatePromises);

        res.status(201).json({
            message: "Thông báo đã được gửi đến toàn bộ người dùng.",
        });
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
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

// Update all notifications to read by user ID
exports.updateAllRead = async (req, res) => {
    try {
        const { userId } = req.query;
        // Tìm kiếm người dùng theo userId
        let user = await User.findById(userId);
        // Kiểm tra xem người dùng có tồn tại không
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Cập nhật tất cả thông báo của người dùng thành đã đọc
        const updatedNotifications = await Notification.updateMany(
            { _id: { $in: user.notifications }, isRead: false },
            { $set: { isRead: true } }
        );
        // Cập nhập thành công thông báo đã đọc
        res.json({
            message: "All notifications updated to read",
        });
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
