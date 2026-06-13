const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.User.create({
            username,
            email,
            password: hashedPassword,
            role: 'USER',
            status: 'ACTIVE'
        });

        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error interno al registrar el usuario. Es posible que el correo o usuario ya existan.');
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await db.User.findOne({
            where: {
                [Op.or]: [{ username: username }, { email: username }]
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciales inválidas. Por favor, intentá nuevamente.');
        }

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