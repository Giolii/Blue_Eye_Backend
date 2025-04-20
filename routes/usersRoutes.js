const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/:id", authenticateJWT, usersController.fetchUserById);

module.exports = router;
