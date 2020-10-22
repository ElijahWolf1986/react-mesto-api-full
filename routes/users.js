const router = require('express').Router();
const { getAllUsers, getUserById, createUser, login } = require('../controllers/users');

router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);

module.exports = { router };
