const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Encriptar la contraseña antes de guardarla en la DB (10 rondas de salt)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.User.create({
            username,
            email,
            password: hashedPassword,
            role: 'USER',
            status: 'ACTIVE'
        });

        // Si se registró exitosamente, lo mandamos al login
        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error interno al registrar el usuario. Es posible que el correo o usuario ya existan.');
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Buscar al usuario por nombre de usuario o por email
        const user = await db.User.findOne({
            where: {
                [Op.or]: [{ username: username }, { email: username }]
            }
        });

        // Validar si el usuario existe y si la contraseña coincide
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciales inválidas. Por favor, intentá nuevamente.');
        }

        // Guardar los datos del usuario en la sesión
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl
        };

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error interno del servidor al procesar el inicio de sesión.');
    }
};

const logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = { registerUser, loginUser, logoutUser };