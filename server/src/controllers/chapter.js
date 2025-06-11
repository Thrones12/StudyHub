const Chapter = require("../models/chapter");
const Subject = require("../models/subject");
const Lesson = require("../models/lesson");

// Get all chapters, sorted by order
exports.getAll = async (req, res) => {
    try {
        const { lessonId } = req.query;

        if (lessonId) {
            // 1. Tìm lesson theo lessonId
            const lesson = await Lesson.findById(lessonId);
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }

            // 2. Tìm chapter chứa lesson đó
            const chapter = await Chapter.findById(lesson.chapterId);
            if (!chapter) {
                return res.status(404).json({ message: "Chapter not found" });
            }

            // 3. Tìm subject chứa chapter đó
            const subject = await Subject.findById(chapter.subjectId).populate({
                path: "chapters",
                model: "Chapter",
                populate: {
                    path: "lessons",
                    model: "Lesson",
                    options: { sort: { order: 1 } },
                },
                options: { sort: { order: 1 } },
            });
            console.log(subject);

            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // 4. Trả về tất cả các chapters thuộc subject
            return res.json(subject.chapters);
        }

        const chapters = await Chapter.find();

        if (!chapters || chapters.length === 0) {
            return res.status(404).json({ message: "No chapters found" });
        }

        res.json(chapters);
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

// Create a new chapter
exports.create = async (req, res) => {
    try {
        const chapter = new Chapter(req.body);
        const newChapter = await chapter.save();
        const subject = await Subject.findById(req.body.subjectId);
        subject.chapters.push(newChapter._id);
        await subject.save();
        res.status(201).json(newChapter);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a chapter by ID
exports.update = async (req, res) => {
    try {
        const updatedchapter = await chapter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedchapter)
            return res.status(404).json({ message: "chapter not found" });
        res.json(updatedchapter);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a chapter by ID
exports.delete = async (req, res) => {
    try {
        const deletedchapter = await chapter.findByIdAndDelete(req.params.id);
        if (!deletedchapter)
            return res.status(404).json({ message: "chapter not found" });
        res.json({ message: "chapter deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
