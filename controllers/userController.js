const db = require('../models');

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.session.user.id;

        const user = await db.User.findByPk(userId, {
            include: [
                {
                    model: db.Post,
                    as: 'posts',
                    include: [
                        { model: db.Image, as: 'image' },
                        { 
                            model: db.Comment, 
                            as: 'comments',
                            include: [{ model: db.User, as: 'user', attributes: ['username', 'avatarUrl'] }]
                        }
                    ]
                },
                { model: db.User, as: 'followers' },
                { model: db.User, as: 'following' }
            ]
        });

        if (!user) return res.status(404).render('error', { message: 'Usuario no encontrado' });

        if (user.posts && user.posts.length > 0) {
            user.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const postIds = user.posts.map(p => p.id);
            const allImages = await db.Image.findAll({ where: { postId: postIds } });
            user.posts.forEach(post => {
                post.dataValues.imagesList = allImages.filter(img => img.postId === post.id || (img.dataValues && img.dataValues.postId === post.id));
                post.imagesList = post.dataValues.imagesList;
            });
        }

        res.render('profile', { profileUser: user });
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        res.status(500).render('error', { message: 'Error interno del servidor al cargar el perfil.' });
    }
};

const getEditProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await db.User.findByPk(userId);
        res.render('edit-profile', { profileUser: user });
    } catch (error) {
        console.error('Error al cargar la edición de perfil:', error);
        res.status(500).render('error', { message: 'Error interno del servidor al cargar la edición de perfil.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { username, bio } = req.body;
        const user = await db.User.findByPk(userId);

        if (!user) return res.status(404).render('error', { message: 'Usuario no encontrado' });

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
            return res.status(400).render('error', { message: 'El nombre de usuario ya está en uso. Por favor, elegí otro.' });
        }
        res.status(500).render('error', { message: 'Error interno al intentar actualizar el perfil.' });
    }
};

const toggleFollow = async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        const targetUserId = req.params.id;

        if (currentUserId.toString() === targetUserId) return res.status(400).render('error', { message: 'No podés seguirte a vos mismo.' });

        const currentUser = await db.User.findByPk(currentUserId);
        const targetUser = await db.User.findByPk(targetUserId, {
            include: [{ model: db.User, as: 'followers' }]
        });

        if (!targetUser) return res.status(404).render('error', { message: 'Usuario no encontrado' });

        const isFollowing = targetUser.followers.some(follower => follower.id === currentUserId);

        if (isFollowing) {
            await targetUser.removeFollower(currentUser);
        } else {
            await targetUser.addFollower(currentUser);
            if (db.Notification) {
                await db.Notification.create({ userId: targetUserId, type: 'FOLLOW', sourceUserId: currentUserId });
            }
        }
        res.redirect(`/profile/${targetUserId}`);
    } catch (error) {
        console.error('Error al seguir/dejar de seguir:', error);
        res.status(500).render('error', { message: 'Error interno al intentar seguir/dejar de seguir.' });
    }
};

const getWallet = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.session.user.id);
        res.render('wallet', { walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar la billetera' });
    }
};

const rechargeWallet = async (req, res) => {
    try {
        const amount = parseFloat(req.body.amount);
        if (!amount || amount <= 0) return res.status(400).render('error', { message: 'Monto inválido' });
        
        const user = await db.User.findByPk(req.session.user.id);
        await user.update({ walletBalance: parseFloat(user.walletBalance) + amount });
        
        res.redirect('/wallet');
    } catch (error) {
        res.status(500).render('error', { message: 'Error al recargar saldo' });
    }
};

module.exports = { getProfile, getEditProfile, updateProfile, toggleFollow, getWallet, rechargeWallet };