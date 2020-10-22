const Card = require('../models/card');

const getAllCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => {
      res.status(500).send({ message: 'Ошибка сервера. Что-то пошло не так...' });
    });
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'переданы некорректные данные в методы создания пользователя!' });
      }
      return res.status(500).send({ message: 'Ошибка сервера. Что то пошло не так..' });
    });
};

const deleteCard = async (req, res) => {
  const deletedCard = await Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => res.status(404).send({ message: 'Такой карты нет!' }));
  res.status(200).send({ data: deletedCard });
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
};
