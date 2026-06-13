const db = require('../models');

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.session.user.id;

        // Buscamos al usuario incluyendo sus posts, seguidores y a los que sigue
        const user = await db.User.findByPk(userId, {
            include: [
                {
                    model: db.Post,
                    as: 'posts',
                    include: [{ model: db.Image, as: 'image' }]
                },
                { model: db.User, as: 'followers' },
                { model: db.User, as: 'following' }
            ]
        });

        if (!user) return res.status(404).send('Usuario no encontrado');

        // Renderizamos la vista pasando los datos como 'profileUser'
        res.render('profile', { profileUser: user });
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        res.status(500).send('Error interno del servidor.');
    }
};

const getEditProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await db.User.findByPk(userId);
        res.render('edit-profile', { profileUser: user });
    } catch (error) {
        console.error('Error al cargar la edición de perfil:', error);
        res.status(500).send('Error interno del servidor.');
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { username, bio } = req.body;
        const user = await db.User.findByPk(userId);

        if (!user) return res.status(404).send('Usuario no encontrado');

        const updateData = { username, bio };

        if (req.files) {
            if (req.files.avatar) updateData.avatarUrl = '/uploads/' + req.files.avatar[0].filename;
            if (req.files.cover) updateData.coverUrl = '/uploads/' + req.files.cover[0].filename;
        }

        await user.update(updateData);

        // Actualizamos la sesión para que se reflejen los cambios en la barra de navegación
        req.session.user.username = user.username;
        req.session.user.avatarUrl = user.avatarUrl;
        req.session.user.coverUrl = user.coverUrl;

        res.redirect('/profile');
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('El nombre de usuario ya está en uso. Por favor, elegí otro.');
        }
        res.status(500).send('Error interno al intentar actualizar el perfil.');
    }
};

module.exports = { getProfile, getEditProfile, updateProfile };