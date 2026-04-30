const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// List tasks for a project (any member)
exports.listForProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.project._id })
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// Create task (Admin only within project)
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { title, description, assignee, status, priority, dueDate } = req.body;

    // If an assignee is provided, they must be a project member
    if (assignee && !req.project.hasMember(assignee)) {
      return res.status(400).json({ message: 'Assignee must be a project member' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: req.project._id,
      assignee: assignee || null,
      createdBy: req.user._id,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// Update task. Members can update status of tasks assigned to them.
// Admins can update anything.
exports.update = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.project.toString() !== req.project._id.toString()) {
      return res.status(400).json({ message: 'Task does not belong to this project' });
    }

    const { title, description, assignee, status, priority, dueDate } = req.body;
    const isAdmin = req.projectRole === 'Admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        message: 'Only project Admins or the task assignee can update this task',
      });
    }

    // Members (non-admin) can only change status
    if (!isAdmin) {
      if (status !== undefined) task.status = status;
    } else {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (assignee !== undefined) {
        if (assignee && !req.project.hasMember(assignee)) {
          return res.status(400).json({ message: 'Assignee must be a project member' });
        }
        task.assignee = assignee || null;
      }
    }

    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Delete task (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.project.toString() !== req.project._id.toString()) {
      return res.status(400).json({ message: 'Task does not belong to this project' });
    }
    if (req.projectRole !== 'Admin') {
      return res.status(403).json({ message: 'Only project Admins can delete tasks' });
    }
    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
