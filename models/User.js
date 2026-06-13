module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'user_id'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('USER', 'VALIDATOR', 'ADMIN'),
            allowNull: false,
            defaultValue: 'USER'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED'),
            allowNull: false,
            defaultValue: 'ACTIVE'
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'avatar_path'
        },
        coverUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'cover_path'
        },
        bio: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'bio_description'
        },
        walletBalance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'wallet_balance'
        },
        strikes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'Users', 
        timestamps: false   
    });

   
    User.associate = (models) => {
        User.hasMany(models.Post, {
            foreignKey: 'userId',
            as: 'posts'
        });
        User.hasMany(models.Collection, {
            foreignKey: 'userId',
            as: 'collections'
        });
        User.hasMany(models.Comment, {
            foreignKey: 'userId',
            as: 'comments'
        });
        User.hasMany(models.Rating, {
            foreignKey: 'userId',
            as: 'ratings'
        });
        User.hasMany(models.Purchase, {
            foreignKey: 'userId',
            as: 'purchases'
        });
        User.hasMany(models.Report, {
            foreignKey: 'userId',
            as: 'reports'
        });
        User.hasMany(models.Notification, {
            foreignKey: 'userId',
            as: 'notifications'
        });
        User.belongsToMany(models.User, {
            through: models.UserFollow,
            as: 'followers',
            foreignKey: 'userTargetId',
            otherKey: 'userId'
        });
        User.belongsToMany(models.User, {
            through: models.UserFollow,
            as: 'following',
            foreignKey: 'userId',
            otherKey: 'userTargetId'
        });
    };

    return User;
};