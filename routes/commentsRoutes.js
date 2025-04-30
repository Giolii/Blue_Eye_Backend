const express = require("express");
const router = express.Router({ mergeParams: true });
const commentsController = require("../controllers/commentsController");

router.get("/", commentsController.getAllComments);
router.post("/", commentsController.createComment);
router.get("/:commentId", commentsController.getComment);
router.put("/:commentId", commentsController.updateComment);
router.delete("/:commentId", commentsController.deleteComment);

module.exports = router;
