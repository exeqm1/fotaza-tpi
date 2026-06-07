module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'tag_id'
        },
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Tags',
        timestamps: false
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Post, { through: models.PostTag, foreignKey: 'tagId', otherKey: 'postId', as: 'posts' });
    };

    return Tag;
};