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

// Configurar Express Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secreto_fotaza',
    resave: false,
    saveUninitialized: false
}));

// Middleware global para pasar los datos de la sesión real a las vistas Pug
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    res.render('index'); 
});

// Usar las rutas de posts (esto mapea automáticamente a /posts y /posts/create)
app.use('/posts', postRoutes);

// Usar las rutas de autenticación
app.use('/auth', authRoutes);

// Usar las rutas de perfil
app.use('/profile', profileRoutes);

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/register', (req, res) => {
    res.render('register'); 
});

app.get('/admin', requireAdmin, (req, res) => {
    res.render('admin'); 
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

async function startServer() {
    try {
        await db.sequelize.authenticate();
        
        // Sincroniza los modelos actualizando las tablas (ej: expandiendo el límite del password)
        await db.sequelize.sync({ alter: true });
        
        console.log('Conexión a la base de datos de Laragon establecida con éxito.');
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();