const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/:id", authenticateJWT, usersController.fetchUserById);
router.put("/:id/avatar", authenticateJWT, usersController.updateAvatar);
router.put("/:id/avatar", authenticateJWT, usersController.updateAvatar);
router.post("/:userId/follow", authenticateJWT, usersController.followUser);
router.post("/:userId/unfollow", authenticateJWT, usersController.unfollowUser);
router.get(
  "/:userId/followers",
  authenticateJWT,
  usersController.fetchFollowers
);

module.exports = router;
