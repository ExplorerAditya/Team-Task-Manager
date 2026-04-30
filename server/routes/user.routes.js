const express = require('express');
const ctrl = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);
router.get('/', ctrl.list);

module.exports = router;
