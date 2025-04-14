const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/", authenticateJWT, postsController.createPost);
router.delete("/:id", authenticateJWT, postsController.deletePost);
router.get("/", authenticateJWT, postsController.fetchPosts);
router.put("/:id", authenticateJWT, postsController.editPost);
router.get("/:id", authenticateJWT, postsController.fetchPostById);
router.get("/users/:id", authenticateJWT, postsController.fetchPostByUser);

module.exports = router;
