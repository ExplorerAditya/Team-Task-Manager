const Project = require('../models/Project');

// Loads project and verifies user is a member; attaches req.project and req.projectRole.
const projectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID required' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Global Admin can access any project
    const role = project.getMemberRole(req.user._id);
    if (!role && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not a member of this project' });
    }
    req.project = project;
    req.projectRole = role || 'Admin'; // global admin treated as project Admin
    next();
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    next(err);
  }
};

// Requires project Admin role (or global Admin)
const projectAdmin = (req, res, next) => {
  if (req.projectRole !== 'Admin') {
    return res.status(403).json({ message: 'Project Admin access required' });
  }
  next();
};

module.exports = { projectMember, projectAdmin };
