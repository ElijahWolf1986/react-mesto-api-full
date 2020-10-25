const router = require('express').Router();
const { getAllCards, createCard, deleteCard } = require('../controllers/cards');
const {
  validateCreateCard,
  validateDeleteCard,
} = require('../middlewares/validationJoi');

router.get('/', getAllCards);
router.post('/', validateCreateCard, createCard);
router.delete('/:cardId', validateDeleteCard, deleteCard);

module.exports = { router };
