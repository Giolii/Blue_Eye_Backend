const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/", authenticateJWT, notificationsController.fetchNotifications);
router.put(
  "/readAll",
  authenticateJWT,
  notificationsController.readAllNotifications
);
router.delete(
  "/clear",
  authenticateJWT,
  notificationsController.clearNotifications
);

module.exports = router;
