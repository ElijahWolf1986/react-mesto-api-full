const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const ConflictError = require('../errors/ConflictError.js');
const UnauthorizedError = require('../errors/UnauthorizedError.js');
const BadRequestError = require('../errors/BadRequestError.js');
const NotFoundError = require('../errors/NotFoundError.js');
const ForbiddenError = require('../errors/ForbiddenError.js');

const { SECRET } = process.env;

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => {
      next(new NotFoundError('Не удалось найти пользователей'));
    });
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => res.status(200).send({ data: user }))
    .catch(() => next(new NotFoundError('Такого пользователя не существует')));
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  return bcrypt.hash(password, 10, async (error, hash) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        return next(new ConflictError('Пользователь с таким email уже есть'));
      }
      return (
        User.create({
          name,
          about,
          avatar,
          email,
          password: hash,
        })
          .then(() => res.status(200).send({
            data: {
              name,
              about,
              avatar,
              email,
            },
          }))
          // eslint-disable-next-line consistent-return
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return next(
                new BadRequestError(err.message),
              );
            }
          })
      );
    } catch (err) {
      return res.status(500).send({ message: 'Что-то пошло не так..' });
    }
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Неправильный логин или пароль'));
    }
    return bcrypt.compare(password, user.password, (err, isValidPassword) => {
      if (!isValidPassword) next(new UnauthorizedError('Неправильный логин или пароль'));
      const token = jwt.sign({ _id: user._id }, SECRET, {
        expiresIn: '7d',
      });

      res.status(200).send({ token });
    });
  } catch (err) {
    return next(new ForbiddenError('Доступ запрещен'));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  login,
};
