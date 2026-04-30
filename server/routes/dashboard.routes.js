const express = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);
router.get('/summary', ctrl.summary);

module.exports = router;
