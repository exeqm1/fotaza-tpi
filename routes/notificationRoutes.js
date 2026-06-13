const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, notificationController.getNotifications);

module.exports = router;