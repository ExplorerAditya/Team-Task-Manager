const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/task.controller');
const { auth } = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/projectAccess');

const router = express.Router();

router.use(auth);

// Tasks are nested under a project
// GET    /api/tasks/project/:projectId        -> list tasks in project
// POST   /api/tasks/project/:projectId        -> create task (admin)
// PUT    /api/tasks/project/:projectId/:taskId -> update task
// DELETE /api/tasks/project/:projectId/:taskId -> delete task (admin)

router.get('/project/:projectId', projectMember, ctrl.listForProject);

router.post(
  '/project/:projectId',
  projectMember,
  projectAdmin,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isLength({ max: 2000 }),
    body('status').optional().isIn(['Todo', 'In Progress', 'Done']),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid due date'),
  ],
  ctrl.create
);

router.put('/project/:projectId/:taskId', projectMember, ctrl.update);
router.delete('/project/:projectId/:taskId', projectMember, ctrl.remove);

module.exports = router;
