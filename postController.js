const db = require('../models');

const getFeed = async (req, res) => {
    try {
        const posts = await db.Post.findAll({
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['username']
            }]
        });
        res.render('posts', { posts });
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

        await db.Post.create({
            user_id: 1,
            title: title,
            description_text: desc,
            price: price ? parseFloat(price) : 0,
            post_status: 'ACTIVE'
        });

        res.redirect('/posts');
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        res.status(500).send('Error interno del servidor al intentar crear la publicación.');
    }
};

module.exports = { getFeed, getCreateForm, createPost };