const Task = require("../models/task");
const User = require("../models/user");

// GET /task?userId=...
const GetAll = async (req, res) => {
    try {
        const { userId, date } = req.query;
        let data; // Dữ liệu return

        // Get dữ liệu
        if (userId) {
            data = await Task.find({ userId });
        } else if (date) {
            const startOfDay = dayjs(date).startOf("day").toDate();
            const endOfDay = dayjs(date).endOf("day").toDate();

            // Lọc theo userId nếu có
            const query = {
                startDate: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
            };
            if (userId) query.userId = userId;

            data = await Task.find(query);
        } else {
            data = await Task.find({});
        }

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not found" });

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// GET /task/get-one?id=.....
const GetOne = async (req, res) => {
    try {
        const { id } = req.query;
        let data; // Dữ liệu trả về

        // Get dữ liệu
        if (id) data = await Task.findById(id);

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not found" });

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// POST /task
const Create = async (req, res) => {
    try {
        const { userId, title, loop, description, date } = req.body;

        // Create new doc
        const newData = new Task({
            userId,
            title,
            loop,
            description,
            date,
        });
        newData.save();

        // Add Task vào User
        const user = await User.findById(userId);
        user.tasks.push(newData._id.toString());
        user.save();

        // 200 - Success
        return res.status(200).json({ data: newData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// PUT /task
const Update = async (req, res) => {
    try {
        const { id, title, loop, description, date } = req.body;

        // Tìm doc
        const existingData = await Task.findById(id);

        // 404 - Not Found
        if (!existingData)
            return res.status(404).json({ message: "Not Found" });

        // Update dữ liệu
        if (title) existingData.title = title;
        if (loop) existingData.loop = loop;
        if (description) existingData.description = description;
        if (date) existingData.date = date;
        await existingData.save();

        // 200 - Success
        return res.status(200).json({ data: existingData });
    } catch (err) {
        return res.status(500).json({ message: "Server error: ", err });
    }
};
// DELETE /task?id=...
const Delete = async (req, res) => {
    try {
        const { id } = req.query;

        // Tìm và xóa dữ liệu
        const data = await Task.findByIdAndDelete(id);

        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Not Found" });

        // Xóa Task trong user
        {
            const user = await User.findById(data.userId);
            // 404 - Not Found
            if (!user) return res.status(404).json({ message: "Not Found" });
            // Xóa bằng filter
            user.tasks = user.tasks.filter((n) => n.toString() !== id);

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
    Delete,
};
