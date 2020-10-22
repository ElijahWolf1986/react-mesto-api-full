const User = require("../models/user");
const bcrypt = require("bcryptjs");
const ConflictError = require("../errors/ConflictError.js");
const UnauthorizedError = require("../errors/UnauthorizedError.js");
const jwt = require("jsonwebtoken");

const SALT_INT = 10;
const SECRET = "hello";

const getAllUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => {
      res
        .status(500)
        .send({ message: "Ошибка сервера. Что-то пошло не так..." });
    });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).orFail(() =>
    res.status(404).send({ message: "Такого пользователя нет!" })
  );
  res.status(200).send({ data: user });
};

const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  return bcrypt.hash(password, SALT_INT, async (error, hash) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        return next(new ConflictError("Пользователь с таким email уже есть")); //проверить правильность отображения ошибки
      }
      return (
        User.create({ name, about, avatar, email, password: hash })
          .then((newUser) => {
            return res.status(200).send({ data: newUser });
          })
          // eslint-disable-next-line consistent-return
          .catch((err) => {
            if (err.name === "ValidationError") {
              return res.status(400).send({ message: err.message });
            }
          })
      );
    } catch (e) {
      return res.status(500).send({ message: "Что-то пошло не так.." });
    }
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new UnauthorizedError("Неправильный логин или пароль"));
    }
    bcrypt.compare(password, user.password, (err, isValidPassword) => {
      if (!isValidPassword)
        return next(new UnauthorizedError("Неправильный логин или пароль"));
      const token = jwt.sign({ _id: user._id }, SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).send({ token });
    });
  } catch (e) {
    return res.status(500).send({ message: "Что-то пошло не так.." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  login,
};
