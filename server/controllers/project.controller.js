const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Create a project
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });
    const populated = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// List projects user has access to (global Admin sees all)
exports.list = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'Admin' ? {} : { 'members.user': req.user._id };
    const projects = await Project.find(filter)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// Get one project (RBAC handled in middleware)
exports.getOne = async (req, res, next) => {
  try {
    const project = await Project.findById(req.project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// Update project (Admin only)
exports.update = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    const populated = await Project.findById(req.project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Delete project (Admin only) - also deletes tasks
exports.remove = async (req, res, next) => {
  try {
    await Task.deleteMany({ project: req.project._id });
    await Project.findByIdAndDelete(req.project._id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// Add a member by email (Admin only)
exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No user with that email' });
    }
    if (req.project.hasMember(user._id)) {
      return res.status(409).json({ message: 'User is already a member' });
    }
    const memberRole = ['Admin', 'Member'].includes(role) ? role : 'Member';
    req.project.members.push({ user: user._id, role: memberRole });
    await req.project.save();
    const populated = await Project.findById(req.project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Remove a member (Admin only) - cannot remove project owner
exports.removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }
    req.project.members = req.project.members.filter(
      (m) => m.user.toString() !== userId
    );
    await req.project.save();
    const populated = await Project.findById(req.project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Update a member's role (Admin only)
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (req.project.owner.toString() === userId && role !== 'Admin') {
      return res.status(400).json({ message: 'Owner must remain Admin' });
    }
    const member = req.project.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    member.role = role;
    await req.project.save();
    const populated = await Project.findById(req.project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};
