const router = require("express").Router();
const { getAllUsers, getUserById } = require("../controllers/users");

router.get("/:id", getUserById);
router.get("/", getAllUsers);

module.exports = { router };
