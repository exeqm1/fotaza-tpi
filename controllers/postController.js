const db = require('../models');
const { Op } = require('sequelize');

const getFeed = async (req, res) => {
    try {
        const userId = req.session && req.session.user ? req.session.user.id : null;
        const query = req.query.q;
        const includeArray = [
            {
                model: db.User,
                as: 'user',
                attributes: ['username', 'avatarUrl']
            },
            {
                model: db.Image,
                as: 'image',
                attributes: ['filePath', 'averageRating']
            },
            {
                model: db.Comment,
                as: 'comments',
                include: [{
                    model: db.User,
                    as: 'user',
                    attributes: ['username', 'avatarUrl']
                }]
            }
        ];
        
        if (userId) {
            includeArray.push({
                model: db.Purchase,
                as: 'purchases',
                required: false,
                where: { userId: userId }
            });
            includeArray.push({
                model: db.Rating,
                as: 'ratings',
                required: false,
                where: { userId: userId }
            });
        }

        const postWhere = query ? {
            [Op.or]: [
                { title: { [Op.like]: `%${query}%` } },
                { descriptionText: { [Op.like]: `%${query}%` } }
            ]
        } : {};

        const posts = await db.Post.findAll({
            where: postWhere,
            include: includeArray,
            order: [['date', 'DESC']]
        });

        let users = [];
        if (query) {
            users = await db.User.findAll({
                where: { username: { [Op.like]: `%${query}%` } },
                attributes: ['id', 'username', 'avatarUrl']
            });
        }

        res.render('posts', { posts, users, query });
    } catch (error) {
        console.error('Error al obtener el feed:', error);
        res.status(500).send('Error interno del servidor al cargar las publicaciones.');
    }
};

const getCreateForm = (req, res) => {
    res.render('create-post');
};

const createPost = async (req, res) => {
    try {
        const { title, desc, price } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Es obligatorio subir al menos una imagen.');
        }

        const newPost = await db.Post.create({
            userId: req.session.user.id,
            title: title,
            descriptionText: desc,
            price: price ? parseFloat(price) : 0,
            forSale: price && parseFloat(price) > 0,
            postStatus: 'ACTIVE'
        });

        for (const file of req.files) {
            await db.Image.create({
                postId: newPost.id,
                title: title,
                filePath: '/uploads/' + file.filename,
                licenseType: 'COPYRIGHT'
            });
        }

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        res.status(500).send('Error interno del servidor al intentar crear la publicación.');
    }
};

const buyPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const buyerId = req.session.user.id;

        const post = await db.Post.findByPk(postId, {
            include: [{ model: db.User, as: 'user' }]
        });

        if (!post) return res.status(404).send('Publicación no encontrada.');
        if (!post.forSale || post.price <= 0) return res.status(400).send('Esta foto no está a la venta.');
        if (post.userId === buyerId) return res.status(400).send('No podés comprar tu propia obra.');

        const existingPurchase = await db.Purchase.findOne({ where: { postId, userId: buyerId } });
        if (existingPurchase) return res.status(400).send('Ya compraste esta fotografía.');

        const buyer = await db.User.findByPk(buyerId);
        if (parseFloat(buyer.walletBalance) < parseFloat(post.price)) {
            return res.status(400).send('Saldo insuficiente en tu billetera. Por favor, recargá primero.');
        }

        await db.sequelize.transaction(async (t) => {
            await buyer.update({ walletBalance: parseFloat(buyer.walletBalance) - parseFloat(post.price) }, { transaction: t });
            await post.user.update({ walletBalance: parseFloat(post.user.walletBalance) + parseFloat(post.price) }, { transaction: t });
            await db.Purchase.create({ userId: buyerId, postId: postId, amount: post.price }, { transaction: t });
        });

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        res.status(500).send('Error interno del servidor al intentar realizar el pago.');
    }
};

const ratePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const value = parseInt(req.body.rating);

        if (!value || value < 1 || value > 5) return res.status(400).send('Calificación inválida.');

        const existingRating = await db.Rating.findOne({ where: { postId, userId } });
        if (existingRating) {
            await existingRating.update({ value });
        } else {
            await db.Rating.create({ postId, userId, value });
        }

        const allRatings = await db.Rating.findAll({ where: { postId } });
        const avg = allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;

        const image = await db.Image.findOne({ where: { postId } });
        if (image) {
            await image.update({ averageRating: avg });
        }

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al calificar:', error);
        res.status(500).send('Error interno al intentar calificar la foto.');
    }
};

const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const content = req.body.content;

        if (!content || content.trim() === '') {
            return res.status(400).send('El comentario no puede estar vacío.');
        }

        const post = await db.Post.findByPk(postId);
        if (!post) return res.status(404).send('Publicación no encontrada.');
        if (!post.allowComments) return res.status(403).send('Los comentarios están cerrados.');

        await db.Comment.create({ userId, postId, content: content.trim() });
        res.redirect('/posts');
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).send('Error interno al intentar agregar el comentario.');
    }
};

const reportPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).send('Debes especificar un motivo.');
        }

        await db.Report.create({
            userId,
            postId,
            reason: reason.trim(),
            contentType: 'POST'
        });

        res.redirect('/posts');
    } catch (error) {
        res.status(500).send('Error interno al reportar.');
    }
};

const reportComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.session.user.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).send('Debes especificar un motivo.');
        }

        await db.Report.create({
            userId,
            commentId,
            reason: reason.trim(),
            contentType: 'COMMENT'
        });

        res.redirect('/posts');
    } catch (error) {
        res.status(500).send('Error interno al reportar.');
    }
};

const toggleComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;

        const post = await db.Post.findByPk(postId);
        if (!post) return res.status(404).send('Publicación no encontrada.');
        if (post.userId !== userId) return res.status(403).send('No autorizado.');

        await post.update({ allowComments: !post.allowComments });
        res.redirect('/posts');
    } catch (error) {
        res.status(500).send('Error interno al cambiar estado de comentarios.');
    }
};

module.exports = { getFeed, getCreateForm, createPost, buyPost, ratePost, addComment, reportPost, reportComment, toggleComments };