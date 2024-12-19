const sequelize = require("./config/connection");
const express = require("express");
const PORT = process.env.PORT || 3004;
const routes = require("./controllers");
const path = require("path");
const cors = require("cors");

const app = new express();
const corsOptions = {
    origin: "http://localhost:5173", // Frontend origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
app.use(routes);

sequelize.sync({ force: false })
    .then(() => {
        app.listen(PORT, () => console.log(`App is listening on port: ${PORT}`));
    });
