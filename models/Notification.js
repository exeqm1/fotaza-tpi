module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'notification_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        sourceUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'source_user_id'
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_read'
        },
        type: {
            type: DataTypes.ENUM('COMMENT', 'RATE', 'LIKE', 'FOLLOW', 'PURCHASE'),
            allowNull: false
        }
    }, {
        tableName: 'Notifications',
        timestamps: false
    });

    Notification.associate = function(models) {
        Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Notification.belongsTo(models.User, { foreignKey: 'sourceUserId', as: 'sourceUser' });
    };

    return Notification;
};