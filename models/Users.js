const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const bcrypt = require("bcrypt");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



class Users extends Model { }


Users.init ( 
    { 
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        userName: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true,
        },
        password: { 
            type: DataTypes.STRING, 
            allowNull: false, 
        },
        profilePic: { 
            type: DataTypes.STRING, 
            allowNull: true, 
        },
        topics: { 
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true, 
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        {
        sequelize,
        hooks: {
            beforeCreate: async (newUserData) => {
                newUserData.password = await bcrypt.hash(newUserData.password, 10);
                return newUserData;
            },
            
            afterCreate: async (newUserData) => {
                const msg = {
                    to: newUserData.email,
                    from: 'ayalaarturo925@gmail.com', // Use your verified sender
                    subject: 'Welcome to GET',
                    text: `Hello ${newUserData.userName}, welcome to our service! We are excited to have you on board.`,
                    html: `<p>Hello <strong>${newUserData.userName}</strong>,</p><p>Welcome to our service! We are excited to have you on board.</p>`,
                };
                await sgMail.send(msg);
            },
            afterUpdate: async (updatedUserData) => {
                const msg = {
                    to: updatedUserData.email,
                    from: 'ayalaarturo925@gmail.com', // Use your verified sender
                    subject: 'Your Profile Has Been Updated',
                    text: `Hello ${updatedUserData.userName}, your profile has been updated. If you did not make this change, please contact support.`,
                    html: `<p>Hello <strong>${updatedUserData.userName}</strong>,</p><p>Your profile has been updated. If you did not make this change, please contact support.</p>`,
                };
                await sgMail.send(msg);
            },
        },
        }
);

module.exports = Users;