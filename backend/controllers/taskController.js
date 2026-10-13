const mongoose = require('mongoose');
const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { taskName, subject, deadline, priority, status } = req.body;

    if (!taskName || !taskName.trim()) {
      return res.status(400).json({ success: false, message: 'Task Name is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!deadline) {
      return res.status(400).json({ success: false, message: 'Deadline date is required' });
    }

    const task = new Task({
      taskName: taskName.trim(),
      subject: subject.trim(),
      deadline,
      priority: priority || 'Medium',
      status: status || 'Pending',
    });

    const savedTask = await task.save();
    return res.status(201).json({ success: true, data: savedTask });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error creating task' });
  }
};

// @desc    Retrieve all tasks
// @route   GET /api/tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error retrieving tasks' });
  }
};

// @desc    Retrieve a single task by ID
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: `Task not found with ID ${id}` });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error retrieving task' });
  }
};

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const { taskName, subject, deadline, priority, status } = req.body;
    const updateData = {};

    if (taskName !== undefined) {
      if (!taskName.trim()) {
        return res.status(400).json({ success: false, message: 'Task Name cannot be empty' });
      }
      updateData.taskName = taskName.trim();
    }

    if (subject !== undefined) {
      if (!subject.trim()) {
        return res.status(400).json({ success: false, message: 'Subject cannot be empty' });
      }
      updateData.subject = subject.trim();
    }

    if (deadline !== undefined) {
      if (!deadline) {
        return res.status(400).json({ success: false, message: 'Deadline date cannot be empty' });
      }
      updateData.deadline = deadline;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: `Task not found with ID ${id}` });
    }

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error updating task' });
  }
};

// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ success: false, message: `Task not found with ID ${id}` });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: task._id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting task' });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
