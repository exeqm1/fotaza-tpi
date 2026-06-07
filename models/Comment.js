module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'comment_id'
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
        content: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Comments',
        timestamps: false
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
    return Comment;
};