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
        
        // Solo buscamos las compras si el usuario inició sesión
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

        // Guardamos todas las imágenes
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

        // Buscar el post y a su dueño
        const post = await db.Post.findByPk(postId, {
            include: [{ model: db.User, as: 'user' }]
        });

        if (!post) return res.status(404).send('Publicación no encontrada.');
        if (!post.forSale || post.price <= 0) return res.status(400).send('Esta foto no está a la venta.');
        if (post.userId === buyerId) return res.status(400).send('No podés comprar tu propia obra.');

        // Verificar que no la haya comprado antes
        const existingPurchase = await db.Purchase.findOne({ where: { postId, userId: buyerId } });
        if (existingPurchase) return res.status(400).send('Ya compraste esta fotografía.');

        // Verificar el saldo del comprador
        const buyer = await db.User.findByPk(buyerId);
        if (parseFloat(buyer.walletBalance) < parseFloat(post.price)) {
            return res.status(400).send('Saldo insuficiente en tu billetera. Por favor, recargá primero.');
        }

        // Transacción Atómica de Compra
        await db.sequelize.transaction(async (t) => {
            // 1. Restamos saldo al comprador y sumamos al dueño de la foto
            await buyer.update({ walletBalance: parseFloat(buyer.walletBalance) - parseFloat(post.price) }, { transaction: t });
            await post.user.update({ walletBalance: parseFloat(post.user.walletBalance) + parseFloat(post.price) }, { transaction: t });
            // 2. Registramos la nueva compra
            await db.Purchase.create({ userId: buyerId, postId: postId, amount: post.price }, { transaction: t });
        });

        res.redirect('/posts'); // Éxito -> Al recargar, la foto ya va a estar desbloqueada
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

        // Verifica si ya había calificado, si es así, actualiza; si no, crea el rating
        const existingRating = await db.Rating.findOne({ where: { postId, userId } });
        if (existingRating) {
            await existingRating.update({ value });
        } else {
            await db.Rating.create({ postId, userId, value });
        }

        // Recalcular el promedio y guardarlo en la Imagen
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

        await db.Comment.create({ userId, postId, content: content.trim() });
        res.redirect('/posts');
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).send('Error interno al intentar agregar el comentario.');
    }
};

module.exports = { getFeed, getCreateForm, createPost, buyPost, ratePost, addComment };