const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const isUser = require("../middleware/isUser");

router.get("/profile", isUser, UserController.profile);

module.exports = router;
