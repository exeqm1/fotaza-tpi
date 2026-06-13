const db = require('../models');

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.session.user.id;

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

const toggleFollow = async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        const targetUserId = req.params.id;

        if (currentUserId.toString() === targetUserId) return res.status(400).send('No podés seguirte a vos mismo.');

        const currentUser = await db.User.findByPk(currentUserId);
        const targetUser = await db.User.findByPk(targetUserId, {
            include: [{ model: db.User, as: 'followers' }]
        });

        if (!targetUser) return res.status(404).send('Usuario no encontrado');

        const isFollowing = targetUser.followers.some(follower => follower.id === currentUserId);

        if (isFollowing) {
            await targetUser.removeFollower(currentUser);
        } else {
            await targetUser.addFollower(currentUser);
            if (db.Notification) {
                await db.Notification.create({ userId: targetUserId, type: 'FOLLOW' });
            }
        }
        res.redirect(`/profile/${targetUserId}`);
    } catch (error) {
        console.error('Error al seguir/dejar de seguir:', error);
        res.status(500).send('Error interno.');
    }
};

const getWallet = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.session.user.id);
        res.render('wallet', { walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).send('Error al cargar la billetera');
    }
};

const rechargeWallet = async (req, res) => {
    try {
        const amount = parseFloat(req.body.amount);
        if (!amount || amount <= 0) return res.status(400).send('Monto inválido');
        
        const user = await db.User.findByPk(req.session.user.id);
        await user.update({ walletBalance: parseFloat(user.walletBalance) + amount });
        
        res.redirect('/wallet');
    } catch (error) {
        res.status(500).send('Error al recargar saldo');
    }
};

module.exports = { getProfile, getEditProfile, updateProfile, toggleFollow, getWallet, rechargeWallet };