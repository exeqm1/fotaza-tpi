const db = require('../models');

const getNotifications = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const notifications = await db.Notification.findAll({
            where: { userId },
            order: [['id', 'DESC']]
        });
        res.render('notifications', { notifications });
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        res.status(500).send('Error interno');
    }
};

module.exports = { getNotifications };