module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'report_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'comment_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'post_id'
        },
        reason: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        contentType: {
            type: DataTypes.ENUM('POST', 'COMMENT'),
            allowNull: false,
            field: 'content_type'
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'Reports',
        timestamps: false
    });

    Report.associate = (models) => {
        Report.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Report.belongsTo(models.Comment, { foreignKey: 'commentId', as: 'comment' });
        Report.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };

    return Report;
};
