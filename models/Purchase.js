module.exports = (sequelize, DataTypes) => {
    const Purchase = sequelize.define('Purchase', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'purchase_id'
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
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Purchases',
        timestamps: false
    });

    Purchase.associate = (models) => {
        Purchase.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Purchase.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
    return Purchase;
};