const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');

const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/app/public/uploads' 
    : path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', requireAuth, userController.getProfile);
router.get('/edit', requireAuth, userController.getEditProfile);
router.post('/edit', requireAuth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateProfile);
router.post('/:id/follow', requireAuth, userController.toggleFollow);
router.get('/:id', requireAuth, userController.getProfile);

module.exports = router;