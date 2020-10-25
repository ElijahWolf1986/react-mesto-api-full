const router = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/users');
const { validateGetUser } = require('../middlewares/validationJoi');

router.get('/:id', validateGetUser, getUserById);
router.get('/', getAllUsers);

module.exports = { router };
