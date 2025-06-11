const Support = require("../models/support");
const Notification = require("../models/notification");
const User = require("../models/user");
const { sendMail } = require("../utils/mailers");

// Get all supports
exports.getAll = async (req, res) => {
    try {
        const supports = await Support.find();
        if (!supports || supports.length === 0) {
            return res.status(404).json({ message: "No supports found" });
        }
        res.json(supports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all show supports
exports.getAllShow = async (req, res) => {
    try {
        const supports = await Support.find({ isShow: true }).sort({
            createdAt: -1,
        });
        if (!supports || supports.length === 0) {
            return res.status(404).json({ message: "No supports found" });
        }
        res.json(supports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one Support by ID
exports.getOne = async (req, res) => {
    try {
        const Support = await Support.findById(req.params.id);
        if (!Support)
            return res.status(404).json({ message: "Support not found" });
        res.json(Support);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new support
exports.create = async (req, res) => {
    try {
        const support = new Support(req.body);
        const newSupport = await support.save();
        res.status(201).json(newSupport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a Support by ID
exports.update = async (req, res) => {
    try {
        const updatedSupport = await Support.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSupport)
            return res.status(404).json({ message: "Support not found" });

        await sendMail({
            to: req.body.email,
            subject: req.body.title,
            html: req.body.answer,
        });

        let notification = new Notification({});
        await notification.save();
        let user = await User.findOne({ email: req.body.email });
        user.notifications.push(notification);
        await user.save();
        res.json(updatedSupport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a Support by ID
exports.delete = async (req, res) => {
    try {
        const deletedSupport = await Support.findByIdAndDelete(req.params.id);
        if (!deletedSupport)
            return res.status(404).json({ message: "Support not found" });
        res.json({ message: "Support deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
