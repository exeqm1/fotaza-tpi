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
        type: {
            type: DataTypes.ENUM('COMMENT', 'RATE', 'LIKE', 'FOLLOW', 'PURCHASE'),
            allowNull: false
        }
    }, {
        tableName: 'Notifications',
        timestamps: false
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
    return Notification;
};