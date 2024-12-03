const Users = require("./Users");
const Posts = require("./Posts");
const Comments = require("./Comments");
const Subscribe = require("./Subscribe");

// * Create associations

// * for users & posts

Users.hasMany(Posts, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});

Posts.belongsTo(Users, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});

// * for posts & comments

Posts.hasMany(Comments, {
    foreignKey: "post_id",
    onDelete: "CASCADE",
});

Comments.belongsTo(Posts, {
    foreignKey: "post_id",
    onDelete: "CASCADE",
});

// * for users & comments

Users.hasMany(Comments, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});

Comments.belongsTo(Users, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});

// * for users & subscribers
Users.hasMany(Subscribe, { foreignKey: 'subscriberId' });
Users.hasMany(Subscribe, { foreignKey: 'subscribedToId' });

Subscribe.belongsTo(Users, { as: 'Subscriber', foreignKey: 'subscriberId' });
Subscribe.belongsTo(Users, { as: 'SubscribedTo', foreignKey: 'subscribedToId' });

module.exports = { Users, Posts, Comments, Subscribe };