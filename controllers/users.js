const User = require("../models/user");
require('dotenv').config();
const bcrypt = require("bcryptjs");
const ConflictError = require("../errors/ConflictError.js");
const UnauthorizedError = require("../errors/UnauthorizedError.js");
const BadRequestError = require("../errors/BadRequestError.js");
const NotFoundError = require("../errors/NotFoundError.js");
const ForbiddenError = require("../errors/ForbiddenError.js");

const jwt = require("jsonwebtoken");
const { SECRET, SALT_INT } = process.env;

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => {
      next(new NotFoundError("Не удалось найти пользователей"));
    });
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => res.status(200).send({ data: user }))
    .catch(() => next(new NotFoundError("Такого пользователя не существует")));
};

const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  return bcrypt.hash(password, SALT_INT, async (error, hash) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        return next(new ConflictError("Пользователь с таким email уже есть"));
      }
      return (
        User.create({ name, about, avatar, email, password: hash })
          .then((newUser) => {
            return res
              .status(200)
              .send({ data: { name, about, avatar, email } });
          })
          // eslint-disable-next-line consistent-return
          .catch((err) => {
            if (err.name === "ValidationError") {
              return next(
                new BadRequestError("Произошла ошибка, пользователь не создан")
              );
            }
          })
      );
    } catch (err) {
      return res.status(500).send({ message: "Что-то пошло не так.." });
    }
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
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
  } catch (err) {
    return next(new ForbiddenError("Доступ запрещен"));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  login,
};
