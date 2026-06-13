const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const postController = require('../controllers/postController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Asegurarnos de que exista la carpeta para guardar las imágenes
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', postController.getFeed);
// Protegemos las rutas de creación con el middleware requireAuth
router.get('/create', requireAuth, postController.getCreateForm);
router.post('/create', requireAuth, upload.array('images', 5), postController.createPost);
router.post('/buy/:id', requireAuth, postController.buyPost);
router.post('/rate/:id', requireAuth, postController.ratePost);
router.post('/comment/:id', requireAuth, postController.addComment);

module.exports = router;