const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');

const db = require('./models'); 

const app = express();

const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, requireAdmin } = require('./middlewares/authMiddleware');
const userController = require('./controllers/userController');
const profileRoutes = require('./routes/profileRoutes');
const walletRoutes = require('./routes/walletRoutes');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'img', 'logo.png'));
});
const fs = require('fs');

console.log(
  fs.existsSync(path.join(__dirname, 'resources', 'img', 'logo.png'))
);

app.use('/resources', express.static(path.join(__dirname, 'resources')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secreto_fotaza',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    res.render('index'); 
});

app.use('/posts', postRoutes);

app.use('/auth', authRoutes);

app.use('/profile', profileRoutes);

app.use('/wallet', walletRoutes);

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/register', (req, res) => {
    res.render('register'); 
});

app.get('/admin', requireAdmin, async (req, res) => {
    try {
        const users = await db.User.findAll({
            where: { role: 'USER' },
            order: [['strikes', 'DESC'], ['id', 'ASC']]
        });
        res.render('admin', { users }); 
    } catch (error) {
        res.render('admin', { users: [] }); 
    }
});

app.post('/admin/strike/:id', requireAdmin, async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (user) {
            await user.update({ strikes: user.strikes + 1, status: user.strikes + 1 >= 3 ? 'BANNED' : user.status });
        }
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Error al aplicar el strike.');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

db.sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida con éxito.');
        return db.sequelize.sync();
    })
    .catch(error => console.error('No se pudo conectar a la base de datos:', error));