const Sound = require("../models/sound");

// Get all sounds
exports.getAll = async (req, res) => {
    try {
        const sounds = await Sound.find();
        if (!sounds || sounds.length === 0) {
            return res.status(404).json({ message: "No sounds found" });
        }
        res.json(sounds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one Sound by ID
exports.getOne = async (req, res) => {
    try {
        const sound = await Sound.findById(req.params.id);
        if (!sound) return res.status(404).json({ message: "sound not found" });
        res.json(sound);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new Sound
exports.create = async (req, res) => {
    try {
        const sound = new Sound(req.body);
        const newSound = await sound.save();
        res.status(201).json(newSound);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a Sound by ID
exports.update = async (req, res) => {
    try {
        const updatedSound = await Sound.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSound)
            return res.status(404).json({ message: "Sound not found" });
        res.json(updatedSound);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a Sound by ID
exports.delete = async (req, res) => {
    try {
        const deletedSound = await Sound.findByIdAndDelete(req.params.id);
        if (!deletedSound)
            return res.status(404).json({ message: "Sound not found" });
        res.json({ message: "Sound deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
