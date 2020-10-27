const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError.js');
const ForbiddenError = require('../errors/ForbiddenError.js');
const BadRequestError = require('../errors/BadRequestError.js');

const getAllCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      next (new BadRequestError('Что-то пошло не так'))
    });
};

const createCard = (req, res) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message:
            'переданы некорректные данные в методы создания карточки!',
        });
      }
      return next (new BadRequestError('Что-то пошло не так'))
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Такой карты не существует'));
      }
      if (req.user !== card.owner) {
        return next(new ForbiddenError('Вы не можете удалять чужие карточки'));
      }
      return (
        Card.findByIdAndRemove(cardId)
          .then((deletedCard) => res.status(200).send({ data: deletedCard }))
          .catch(() => next(new NotFoundError('карта не найдена')))
      );
    });
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
};
