module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'image_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        title: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        filePath: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'file_path'
        },
        licenseType: {
            type: DataTypes.ENUM('COPYRIGHT', 'PUBLIC_DOMAIN'),
            allowNull: false,
            field: 'license_type'
        },
        averageRating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'average_rating'
        },
        watermarkText: {
            type: DataTypes.STRING(50),
            field: 'watermark_text'
        }
    }, {
        tableName: 'Image',
        timestamps: false
    });

    Image.associate = (models) => {
        Image.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
    return Image;
};