const { Op } = require('sequelize');
const db = require('../models');

const search = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.redirect('/posts');

        // Buscar Usuarios (por su username)
        const users = await db.User.findAll({
            where: {
                username: { [Op.like]: `%${query}%` }
            },
            attributes: ['id', 'username', 'avatarUrl', 'bio']
        });

        // Buscar Publicaciones (por título o por descripción simulando tags)
        const userId = req.session && req.session.user ? req.session.user.id : null;
        const includeArray = [
            { model: db.User, as: 'user', attributes: ['username', 'avatarUrl'] },
            { model: db.Image, as: 'image', attributes: ['filePath', 'averageRating'] },
            { model: db.Comment, as: 'comments', include: [{ model: db.User, as: 'user', attributes: ['username', 'avatarUrl'] }] }
        ];

        if (userId) {
            includeArray.push({ model: db.Purchase, as: 'purchases', required: false, where: { userId } });
            includeArray.push({ model: db.Rating, as: 'ratings', required: false, where: { userId } });
        }

        const posts = await db.Post.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { descriptionText: { [Op.like]: `%${query}%` } }
                ]
            },
            include: includeArray,
            order: [['date', 'DESC']]
        });

        // Enviar resultados a la nueva vista
        res.render('search', { users, posts, query });
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).send('Error interno al realizar la búsqueda.');
    }
};

module.exports = { search };