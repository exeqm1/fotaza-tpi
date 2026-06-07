module.exports = (sequelize, DataTypes) => {
    const PostTag = sequelize.define('PostTag', {
        postId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'post_id'
        },
        tagId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: 'tag_id'
        }
    }, {
        tableName: 'Post_Tags',
        timestamps: false
    });

    return PostTag;
};