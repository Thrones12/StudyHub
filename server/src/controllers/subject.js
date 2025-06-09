const Subject = require("../models/subject");
const Course = require("../models/course");
const Chapter = require("../models/chapter");

// Get all subjects, optionally filtered by courseId and sorted by order
exports.getAll = async (req, res) => {
    try {
        const { courseId } = req.query;
        let data = [];
        if (courseId) {
            let subjects = await Subject.find({ courseId })
                .populate({ path: "chapters", model: "Chapter" })
                .sort({ order: 1 });
            for (let subject of subjects) {
                let lessonCount = 0;
                for (let chapterId of subject.chapters) {
                    let chapter = await Chapter.findById(chapterId);
                    lessonCount += chapter.lessons.length;
                }
                data.push({ ...subject._doc, lessonCount });
            }
        } else {
            data = await Subject.find({})
                .sort({ order: 1 })
                .populate({
                    path: "chapters",
                    model: "Chapter",
                    populate: { path: "lessons", model: "Lesson" },
                });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one subject by ID
exports.getOne = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject)
            return res.status(404).json({ message: "Subject not found" });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new subject
exports.create = async (req, res) => {
    try {
        const subject = new Subject(req.body);
        const newSubject = await subject.save();
        const course = await Course.findById(req.body.courseId);
        course.subjects.push(newSubject._id);
        await course.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a subject by ID
exports.update = async (req, res) => {
    try {
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSubject)
            return res.status(404).json({ message: "Subject not found" });
        res.json(updatedSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a subject by ID
exports.delete = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject)
            return res.status(404).json({ message: "Subject not found" });
        let course = await Course.findById(deletedSubject.courseId);
        course.subjects = course.subjects.filter(
            (subject) =>
                subject._id.toString() !== deletedSubject._id.toString()
        );
        await course.save();
        res.json({ message: "Subject deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
