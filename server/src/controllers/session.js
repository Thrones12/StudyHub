const Session = require("../models/session");
const User = require("../models/user");

// Get all session
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.query;
        let sessions;
        if (userId) {
            const user = await User.findById(userId).populate({
                path: "sessions",
                options: { sort: { createdAt: -1 } }, // sort trong populate
            });

            const sessions = user.sessions;
            return res.json(sessions);
        } else {
            const sessions = await Session.find().sort({ createdAt: -1 });
            return res.json(sessions);
        }

        if (!sessions) {
            return res.status(404).json({ message: "No sessions found" });
        }
        return res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one session by ID
exports.getOne = async (req, res) => {
    try {
        const session = await session.findById(req.params.id);
        if (!session)
            return res.status(404).json({ message: "session not found" });
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new session
exports.create = async (req, res) => {
    try {
        const { userId, title, targetTime } = req.body;
        if (!title || title === "")
            return res.status(400).json({ message: "Mời nhập tiêu đề" });
        const session = new Session({ title, targetTime });
        await session.save();
        console.log(userId);

        if (userId) {
            let user = await User.findById(userId);
            user.sessions.push(session._id);
            await user.save();
        }
        res.status(201).json(session);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a session by ID
exports.update = async (req, res) => {
    try {
        const { id, title, spentTime, targetTime, isDone } = req.body;

        const updatedSession = await Session.findById(id);
        if (!updatedSession)
            return res.status(404).json({ message: "Session not found" });
        if (title) updatedSession.title = title;
        if (spentTime) updatedSession.spentTime = spentTime;
        if (targetTime) updatedSession.targetTime = targetTime;
        if (isDone === true || isDone === false) updatedSession.isDone = isDone;
        await updatedSession.save();
        res.json(updatedSession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a session by ID
exports.delete = async (req, res) => {
    try {
        const deletedSession = await Session.findByIdAndDelete(req.params.id);
        if (!deletedSession)
            return res.status(404).json({ message: "Session not found" });
        res.json({ message: "Session deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
