const db = require('../models');

const getNotifications = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const notifications = await db.Notification.findAll({
            where: { userId },
            include: [{ model: db.User, as: 'sourceUser', attributes: ['username'], required: false }],
            order: [['id', 'DESC']]
        });
        
        await db.Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        res.locals.notificationCount = 0; // Forzamos el globo a 0 en esta vista
        
        res.render('notifications', { notifications });
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        res.status(500).render('error', { message: 'Error interno al cargar las notificaciones.' });
    }
};

module.exports = { getNotifications };