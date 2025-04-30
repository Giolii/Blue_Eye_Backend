const prisma = require("../config/prisma");
const { sanitizeUser, userFields } = require("../utils/sanitizeUser");

const commentsController = {
  async getAllComments(req, res) {
    const { postId } = req.params;
    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async createComment(req, res) {
    const { postId } = req.params;
    const { content } = req.body;

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId: req.user.id,
          content,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });
      // ok

      if (post.userId !== req.user.id) {
        const notificationData = {
          userId: post.userId,
          type: "NEW_COMMENT",
          message: `${comment.user.username} commented your post`,
          postId: post.id,
          data: {
            content: comment.content,
            imageUrl: post.imageUrl,
            commentId: comment.id,
            sentBy: {
              id: comment.user.id,
              username: comment.user.username,
              avatar: comment.user.avatar,
            },
          },
          createdAt: new Date(),
        };

        const notification = await prisma.notification.create({
          data: notificationData,
        });

        const ownerSocketId = connectedUsers.get(post.userId);
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("notification", {
            ...notification,
            createdAt: notification.createdAt,
          });
        }
      }

      // ok

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getComment(req, res) {
    const { commentId } = req.params;

    try {
      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async updateComment(req, res) {
    const { commentId } = req.params;
    const { content } = req.body;
    try {
      const comment = await prisma.comment.update({
        where: {
          id: commentId,
          userId: req.user.id,
        },
        data: {
          content,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteComment(req, res) {
    const { commentId } = req.params;
    try {
      const comment = await prisma.comment.delete({
        where: {
          id: commentId,
          userId: req.user.id,
        },
      });
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = commentsController;
