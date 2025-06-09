const Theme = require("../models/theme");
const User = require("../models/user");

// Get all theme, sorted by order
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.query;
        let themes;
        if (userId) {
            let user = await User.findById(userId);
            themes = user.customThemes;
            return res.json(themes);
        } else {
            themes = await Theme.find();
        }

        if (!themes) {
            return res.status(404).json({ message: "No themes found" });
        }
        return res.json(themes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one chapter by ID
exports.getOne = async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter)
            return res.status(404).json({ message: "Chapter not found" });
        res.json(chapter);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new theme
exports.create = async (req, res) => {
    try {
        const theme = new Theme(req.body);
        await theme.save();
        res.status(201).json(theme);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a theme by ID
exports.update = async (req, res) => {
    try {
        const updatedTheme = await Theme.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedTheme)
            return res.status(404).json({ message: "Theme not found" });
        res.json(updatedTheme);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a theme by ID
exports.delete = async (req, res) => {
    try {
        const deletedTheme = await Theme.findByIdAndDelete(req.params.id);
        if (!deletedTheme)
            return res.status(404).json({ message: "Theme not found" });
        res.json({ message: "Theme deleted" });
    } catch (err) {
        console.log(err);

        res.status(500).json({ message: err.message });
    }
};
