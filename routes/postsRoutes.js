const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const commentsRoutes = require("../routes/commentsRoutes");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/", authenticateJWT, postsController.createPost);
router.post("/:id/share", authenticateJWT, postsController.sharePost);
router.post("/:id/like", authenticateJWT, postsController.likePost);
router.delete("/:id", authenticateJWT, postsController.deletePost);
router.get("/", authenticateJWT, postsController.fetchPosts);
router.put("/:id", authenticateJWT, postsController.editPost);
router.get("/:id", authenticateJWT, postsController.fetchPostById);
router.get("/users/:id", authenticateJWT, postsController.fetchPostByUser);

router.use("/:postId/comments", authenticateJWT, commentsRoutes);

module.exports = router;
