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
                attributes: ['filePath']
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

        const postIds = posts.map(p => p.id);
        if (postIds.length > 0) {
            const allImages = await db.Image.findAll({
                where: { postId: postIds },
                attributes: ['postId', 'filePath']
            });
            
            const allTags = await db.sequelize.query(
                'SELECT pt.post_id, t.title FROM Post_Tags pt JOIN Tags t ON pt.tag_id = t.tag_id WHERE pt.post_id IN (:postIds)',
                { replacements: { postIds: postIds }, type: db.sequelize.QueryTypes.SELECT }
            ).catch(() => []);

            posts.forEach(post => {
                post.dataValues.imagesList = allImages.filter(img => img.postId === post.id || (img.dataValues && img.dataValues.postId === post.id));
                post.imagesList = post.dataValues.imagesList;
                post.dataValues.tagsList = allTags.filter(t => t.post_id === post.id).map(t => t.title);
                post.tagsList = post.dataValues.tagsList;
            });
        }

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
        res.status(500).render('error', { message: 'Error interno del servidor al cargar las publicaciones.' });
    }
};

const getCreateForm = (req, res) => {
    res.render('create-post');
};

const createPost = async (req, res) => {
    try {
        const { title, desc, price, tags } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).render('error', { message: 'Es obligatorio subir al menos una imagen.' });
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

        if (tags && tags.trim() !== '') {
            const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '').slice(0, 5);
            for (const tagName of tagArray) {
                try {
                    await db.sequelize.query(
                        'INSERT IGNORE INTO Tags (title) VALUES (:title)',
                        { replacements: { title: tagName }, type: db.sequelize.QueryTypes.INSERT }
                    );
                    const [tagRecords] = await db.sequelize.query(
                        'SELECT tag_id FROM Tags WHERE title = :title LIMIT 1',
                        { replacements: { title: tagName }, type: db.sequelize.QueryTypes.SELECT }
                    );
                    if (tagRecords && tagRecords.tag_id) {
                        await db.sequelize.query(
                            'INSERT IGNORE INTO Post_Tags (post_id, tag_id) VALUES (:postId, :tagId)',
                            { replacements: { postId: newPost.id, tagId: tagRecords.tag_id }, type: db.sequelize.QueryTypes.INSERT }
                        );
                    }
                } catch (err) {
                    console.error('Error al guardar tag:', err);
                }
            }
        }

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        res.status(500).render('error', { message: 'Error interno del servidor al intentar crear la publicación.' });
    }
};

const buyPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const buyerId = req.session.user.id;

        const post = await db.Post.findByPk(postId, {
            include: [{ model: db.User, as: 'user' }]
        });

        if (!post) return res.status(404).render('error', { message: 'Publicación no encontrada.' });
        if (!post.forSale || post.price <= 0) return res.status(400).render('error', { message: 'Esta foto no está a la venta.' });
        if (post.userId === buyerId) return res.status(400).render('error', { message: 'No podés comprar tu propia obra.' });

        const existingPurchase = await db.Purchase.findOne({ where: { postId, userId: buyerId } });
        if (existingPurchase) return res.status(400).render('error', { message: 'Ya compraste esta fotografía.' });

        const buyer = await db.User.findByPk(buyerId);
        if (parseFloat(buyer.walletBalance) < parseFloat(post.price)) {
            return res.status(400).render('error', { message: 'Saldo insuficiente en tu billetera. Por favor, recargá primero.' });
        }

        await db.sequelize.transaction(async (t) => {
            await buyer.update({ walletBalance: parseFloat(buyer.walletBalance) - parseFloat(post.price) }, { transaction: t });
            await post.user.update({ walletBalance: parseFloat(post.user.walletBalance) + parseFloat(post.price) }, { transaction: t });
            await db.Purchase.create({ userId: buyerId, postId: postId, amount: post.price }, { transaction: t });
            if (db.Notification) {
                await db.Notification.create({ userId: post.userId, type: 'PURCHASE', sourceUserId: buyerId }, { transaction: t });
            }
        });

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        res.status(500).render('error', { message: 'Error interno del servidor al intentar realizar el pago.' });
    }
};

const ratePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const value = parseInt(req.body.rating);

        if (!value || value < 1 || value > 5) return res.status(400).render('error', { message: 'Calificación inválida.' });

        const existingRating = await db.Rating.findOne({ where: { postId, userId } });
        if (existingRating) {
            await existingRating.update({ value });
        } else {
            await db.Rating.create({ postId, userId, value });
            if (db.Notification) {
                const post = await db.Post.findByPk(postId);
                if (post && post.userId !== userId) {
                    await db.Notification.create({ userId: post.userId, type: 'RATE', sourceUserId: userId });
                }
            }
        }

        const allRatings = await db.Rating.findAll({ where: { postId } });
        const avg = allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;

        const postToUpdate = await db.Post.findByPk(postId);
        if (postToUpdate) {
            await postToUpdate.update({ averageRating: avg });
        }

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al calificar:', error);
        res.status(500).render('error', { message: 'Error interno al intentar calificar la foto.' });
    }
};

const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const content = req.body.content;

        if (!content || content.trim() === '') {
            return res.status(400).render('error', { message: 'El comentario no puede estar vacío.' });
        }

        const post = await db.Post.findByPk(postId);
        if (!post) return res.status(404).render('error', { message: 'Publicación no encontrada.' });
        if (!post.allowComments) return res.status(403).render('error', { message: 'Los comentarios están cerrados.' });

        await db.Comment.create({ userId, postId, content: content.trim() });
        if (db.Notification && post.userId !== userId) {
            await db.Notification.create({ userId: post.userId, type: 'COMMENT', sourceUserId: userId });
        }
        res.redirect('/posts');
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).render('error', { message: 'Error interno al intentar agregar el comentario.' });
    }
};

const reportPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).render('error', { message: 'Debes especificar un motivo.' });
        }

        await db.Report.create({
            userId,
            postId,
            reason: reason.trim(),
            contentType: 'POST'
        });

        res.redirect('/posts');
    } catch (error) {
        res.status(500).render('error', { message: 'Error interno al reportar.' });
    }
};

const reportComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.session.user.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).render('error', { message: 'Debes especificar un motivo.' });
        }

        await db.Report.create({
            userId,
            commentId,
            reason: reason.trim(),
            contentType: 'COMMENT'
        });

        res.redirect('/posts');
    } catch (error) {
        res.status(500).render('error', { message: 'Error interno al reportar.' });
    }
};

const toggleComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;

        const post = await db.Post.findByPk(postId);
        if (!post) return res.status(404).render('error', { message: 'Publicación no encontrada.' });
        if (post.userId !== userId) return res.status(403).render('error', { message: 'No autorizado para realizar esta acción.' });

        await post.update({ allowComments: !post.allowComments });
        res.redirect('/posts');
    } catch (error) {
        res.status(500).render('error', { message: 'Error interno al cambiar estado de comentarios.' });
    }
};

module.exports = { getFeed, getCreateForm, createPost, buyPost, ratePost, addComment, reportPost, reportComment, toggleComments };