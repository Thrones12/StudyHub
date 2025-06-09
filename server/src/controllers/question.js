const Question = require("../models/question");
const Exam = require("../models/exam");
const Lesson = require("../models/lesson");
const Chapter = require("../models/chapter");
const Subject = require("../models/subject");
const Course = require("../models/course");

// Get all questions, sorted by order
exports.getAll = async (req, res) => {
    try {
        const questions = await Question.find();

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No question found" });
        }

        res.json(questions);
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

// Create a new question
exports.create = async (req, res) => {
    try {
        const question = new Question(req.body);
        const newQuestion = await question.save();

        res.status(201).json(newQuestion);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};

// Update a question by ID
exports.update = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedQuestion)
            return res.status(404).json({ message: "Question not found" });
        res.json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a question by ID
exports.delete = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion)
            return res.status(404).json({ message: "Question not found" });
        res.json({ message: "Question deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
