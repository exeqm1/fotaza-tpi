module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'rating_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'Ratings',
        timestamps: false
    });

    Rating.associate = (models) => {
        Rating.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Rating.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
    return Rating;
};