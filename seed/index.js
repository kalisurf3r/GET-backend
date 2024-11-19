const { Users, Posts, Comments } = require("../models");
const usersData = require("./users.json");
const postsData = require("./posts.json");
const commentsData = require("./comments.json");

const sequelize = require("../config/connection");

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await Users.bulkCreate(usersData, { individualHooks: true });

  await Posts.bulkCreate(postsData);

  await Comments.bulkCreate(commentsData);

  console.log("Database seeded!");
  process.exit(0);
};

seedDatabase();
