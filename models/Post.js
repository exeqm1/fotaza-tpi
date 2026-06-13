module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'post_id'
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
        descriptionText: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'description_text'
        },
        allowComments: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'allow_comments'
        },
        postStatus: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            field: 'post_status'
        },
        forSale: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'for_sale'
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_locked'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        averageRating: { 
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        tableName: 'Posts',
        timestamps: false
    });

    Post.associate = (models) => {
        Post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Post.hasOne(models.Image, { foreignKey: 'postId', as: 'image' });
        Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
        Post.hasMany(models.Rating, { foreignKey: 'postId', as: 'ratings' });
        Post.hasMany(models.Purchase, { foreignKey: 'postId', as: 'purchases' });
        Post.hasMany(models.Report, { foreignKey: 'postId', as: 'reports' });
        Post.belongsToMany(models.Tag, { through: models.PostTag, foreignKey: 'postId', otherKey: 'tagId', as: 'tags' });
        Post.belongsToMany(models.Collection, { through: models.CollectionPost, foreignKey: 'postId', otherKey: 'collectionId', as: 'collections' });
    };

    return Post;
};