const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");


class Subscribe extends Model { }

Subscribe.init(
    { 
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    subscriberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    subscribedToId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    sequelize,
});

Subscribe.associate = function(models) {
    Subscribe.belongsTo(models.Users, { as: 'Subscriber', foreignKey: 'subscriberId' });
    Subscribe.belongsTo(models.Users, { as: 'SubscribedTo', foreignKey: 'subscribedToId' });
};

module.exports = Subscribe;