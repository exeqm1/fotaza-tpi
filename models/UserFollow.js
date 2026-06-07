module.exports = (sequelize, DataTypes) => {
    const UserFollow = sequelize.define('UserFollow', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'follows_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        userTargetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_target_id'
        }
    }, {
        tableName: 'User_Follows',
        timestamps: false
    });

    UserFollow.associate = (models) => {
        UserFollow.belongsTo(models.User, { foreignKey: 'userId', as: 'follower' });
        UserFollow.belongsTo(models.User, { foreignKey: 'userTargetId', as: 'following' });
    };
    return UserFollow;
};