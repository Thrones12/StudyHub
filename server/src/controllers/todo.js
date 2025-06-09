const Todo = require("../models/todo");
const User = require("../models/user");

// Get all todo, sorted by order
exports.getAll = async (req, res) => {
    try {
        const { userId } = req.query;
        let todos;
        if (userId) {
            let user = await User.findById(userId).populate({
                path: "todos",
                options: { sort: { createdAt: -1 } }, // sort ngay khi populate
            });
            todos = user.todos;
            return res.json(todos);
        } else {
            todos = await Todo.find().sort({ createdAt: -1 });
        }

        if (!todos) {
            return res.status(404).json({ message: "No todos found" });
        }
        return res.json(todos);
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

// Create a new todo
exports.create = async (req, res) => {
    try {
        const { name, userId } = req.body;

        const todo = new Todo({ name });
        await todo.save();

        const user = await User.findById(userId);
        user.todos.push(todo._id);
        await user.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a todo by ID
exports.update = async (req, res) => {
    try {
        const { id, name, order, tasks } = req.body;

        const updatedTodo = await Todo.findById(id);
        if (!updatedTodo)
            return res.status(404).json({ message: "Todo not found" });

        if (name) updatedTodo.name = name;
        if (order) updatedTodo.order = order;
        if (tasks) updatedTodo.tasks = [...tasks];

        await updatedTodo.save();
        res.json(updatedTodo);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};

// Delete a chapter by ID
exports.delete = async (req, res) => {
    try {
        const { todoId, userId } = req.query;
        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        if (!deletedTodo)
            return res.status(404).json({ message: "Todo not found" });
        const user = await User.findById(userId);
        user.todos = user.todos.filter(
            (todo) => todo._id.toString() !== todoId
        );
        await user.save();
        res.json({ message: "Todo deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
