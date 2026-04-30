const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/project.controller');
const { auth } = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/projectAccess');

const router = express.Router();

// All project routes require authentication
router.use(auth);

router.get('/', ctrl.list);

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').optional().isLength({ max: 1000 }),
  ],
  ctrl.create
);

router.get('/:id', projectMember, ctrl.getOne);
router.put('/:id', projectMember, projectAdmin, ctrl.update);
router.delete('/:id', projectMember, projectAdmin, ctrl.remove);

// Member management
router.post('/:id/members', projectMember, projectAdmin, ctrl.addMember);
router.delete('/:id/members/:userId', projectMember, projectAdmin, ctrl.removeMember);
router.put('/:id/members/:userId', projectMember, projectAdmin, ctrl.updateMemberRole);

module.exports = router;
