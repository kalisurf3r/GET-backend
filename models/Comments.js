const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Comments extends Model { }

Comments.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
    }
);

module.exports = Comments;