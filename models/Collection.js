module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define('Collection', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'collection_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        title: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        public: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Collections',
        timestamps: false
    });

    Collection.associate = (models) => {
        Collection.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Collection.belongsToMany(models.Post, { through: models.CollectionPost, foreignKey: 'collectionId', otherKey: 'postId', as: 'posts' });
    };
    return Collection;
};