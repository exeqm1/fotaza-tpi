module.exports = (sequelize, DataTypes) => {
    const CollectionPost = sequelize.define('CollectionPost', {
        collectionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'collection_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'post_id'
        }
    }, {
        tableName: 'Collections_Post',
        timestamps: false
    });

    return CollectionPost;
};