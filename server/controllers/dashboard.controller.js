const Task = require('../models/Task');
const Project = require('../models/Project');

// Per-user dashboard: stats across all projects user is in
exports.summary = async (req, res, next) => {
  try {
    const isGlobalAdmin = req.user.role === 'Admin';

    // Find projects user belongs to (or all if global admin)
    const projectFilter = isGlobalAdmin ? {} : { 'members.user': req.user._id };
    const projects = await Project.find(projectFilter).select('_id name');
    const projectIds = projects.map((p) => p._id);

    const baseTaskFilter = { project: { $in: projectIds } };

    const now = new Date();

    const [
      totalProjects,
      totalTasks,
      todoCount,
      inProgressCount,
      doneCount,
      overdueCount,
      myTasks,
      recentTasks,
    ] = await Promise.all([
      projects.length,
      Task.countDocuments(baseTaskFilter),
      Task.countDocuments({ ...baseTaskFilter, status: 'Todo' }),
      Task.countDocuments({ ...baseTaskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...baseTaskFilter, status: 'Done' }),
      Task.countDocuments({
        ...baseTaskFilter,
        status: { $ne: 'Done' },
        dueDate: { $lt: now, $ne: null },
      }),
      Task.find({ ...baseTaskFilter, assignee: req.user._id })
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .sort({ dueDate: 1, createdAt: -1 })
        .limit(20),
      Task.find(baseTaskFilter)
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoCount,
        inProgressCount,
        doneCount,
        overdueCount,
      },
      myTasks,
      recentTasks,
      projects,
    });
  } catch (err) {
    next(err);
  }
};
