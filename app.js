const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require("body-parser");
const { errors } = require("celebrate");
const { PORT = 3000 } = process.env;
const app = express();
const usersRouter = require("./routes/users").router;
const cardsRouter = require("./routes/cards").router;
const { login, createUser } = require("./controllers/users");
const NotFoundError = require("./errors/NotFoundError.js");
const { auth } = require("./middlewares/auth");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/signin", login);
app.post("/signup", createUser);

app.use("/users", auth, usersRouter);

app.use("/cards", auth, cardsRouter);

app.use(() => {
  throw new NotFoundError({ message: "Запрашиваемый ресурс не найден" });
});

app.use(errors());

app.use((err, req, res, next) =>
  res.status(err.status || 500).send({ message: err.message })
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
