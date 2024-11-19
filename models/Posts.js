const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Posts extends Model { }

Posts.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dislikes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
    }
);

module.exports = Posts;
