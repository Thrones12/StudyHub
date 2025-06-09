const Course = require("../models/course");

// Get all courses, sorted by order
exports.getAll = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({ path: "subjects", populate: { path: "chapters" } })
            .sort({ order: 1 }); // 1 = tăng dần, -1 = giảm dần

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "No courses found" });
        }

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one course by ID
exports.getOne = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate({
            path: "subjects",
            populate: { path: "chapters" },
        });
        if (!course)
            return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new course
exports.create = async (req, res) => {
    try {
        const course = new Course(req.body);
        const newCourse = await course.save();

        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a Course by ID
exports.update = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCourse)
            return res.status(404).json({ message: "Course not found" });
        res.json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a Course by ID
exports.delete = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse)
            return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
