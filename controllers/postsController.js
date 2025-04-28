const prisma = require("../config/prisma");
const { sanitizeUser, userFields } = require("../utils/sanitizeUser");

const postsController = {
  async createPost(req, res) {
    const content = req.body.content.trim();
    const userId = req.user.id;
    const image = req.body.imageUrl;

    if (!content && !image) {
      return res
        .status(400)
        .json({ message: "You need to provide some content" });
    }
    try {
      const post = await prisma.post.create({
        data: {
          content,
          userId,
          imageUrl: image || null,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });

      return res.status(201).json({ post });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Failed to create post" });
    }
  },
  async deletePost(req, res) {
    const postId = req.params.id;
    if (!postId) {
      return res.status(400).json({ message: "You need to provide a post id" });
    }
    try {
      const postDeleted = await prisma.post.delete({
        where: {
          id: postId,
          userId: req.user.id,
        },
      });

      return res.status(200).json({ postDeleted });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Post not found or not authorized" });
      }
      console.error("Error deleting post:", error);
      return res.status(500).json({ message: "Failed to delete post" });
    }
  },

  async fetchPosts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const posts = await prisma.post.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: userFields,
          },
          originalPost: {
            include: {
              user: {
                select: userFields,
              },
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true, // Get total count of likes
            },
          },
        },
      });

      const totalPosts = await prisma.post.count();

      const hasMore = skip + posts.length < totalPosts;

      return res.status(200).json({
        posts,
        hasMore,
        nextPage: hasMore ? parseInt(page) + 1 : null,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
  },

  async editPost(req, res) {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    try {
      const post = await prisma.post.update({
        where: {
          id: postId,
          userId,
        },
        data: {
          content,
        },
        include: {
          user: {
            select: userFields,
          },
          originalPost: {
            include: {
              user: {
                select: userFields,
              },
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true, // Get total count of likes
            },
          },
        },
      });

      return res.status(200).json({ post });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Post not found or not authorized" });
      }
      console.error("Error editing post:", error);
      return res.status(500).json({ message: "Failed  editing posts" });
    }
  },
  async fetchPostById(req, res) {
    const postId = req.params.id;

    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          user: {
            select: userFields,
          },
        },
      });

      return res.status(200).json({ post });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Post not found" });
      }
      console.error("Error fetching post:", error);
      return res.status(500).json({ message: "Failed  fetching post" });
    }
  },
  async fetchPostByUser(req, res) {
    const userId = req.params.id;

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userFields,
    });

    try {
      const posts = await prisma.post.findMany({
        where: { userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: userFields,
          },
          originalPost: {
            include: {
              user: {
                select: userFields,
              },
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true, // Get total count of likes
            },
          },
        },
      });

      const totalPosts = await prisma.post.count({
        where: { userId },
      });

      const hasMore = skip + posts.length < totalPosts;

      return res.status(200).json({
        user,
        posts,
        hasMore,
        nextPage: hasMore ? parseInt(page) + 1 : null,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Posts or User not found" });
      }
      console.error("Error fetching posts by user:", error);
      return res.status(500).json({ message: "Failed to fetch posts by user" });
    }
  },
  async sharePost(req, res) {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId) {
      return res.status(401).json({ message: "You need to provide a post Id" });
    }

    try {
      const postToShare = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!postToShare) {
        return res.status(404).json({ message: "Post not found" });
      }

      const post = await prisma.post.create({
        data: {
          content: content.trim() || "",
          userId: userId,
          originalPostId: postId,
        },
        include: {
          user: {
            select: userFields,
          },
          originalPost: {
            include: {
              user: {
                select: userFields,
              },
            },
          },
        },
      });

      return res.status(201).json({ post });
    } catch (error) {
      console.error("Error sharing post:", error);
      return res.status(500).json({ message: "Failed to share post" });
    }
  },

  async likePost(req, res) {
    const postId = req.params.id;
    const userId = req.user.id;

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    try {
      const likeExists = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (likeExists) {
        const dislikePost = await prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });
        return res.status(200).json({ message: "Post unliked successfully" });
      }

      const like = await prisma.like.create({
        data: {
          userId,
          postId,
        },
        include: {
          user: {
            select: userFields,
          },
          post: {},
        },
      });

      if (like.post.userId !== userId) {
        const notificationData = {
          userId: like.post.userId,
          type: "POST_LIKED",
          message: `${like.user.username} liked your post`,
          postId: like.postId,
          data: {
            likeId: like.id,
            likedBy: {
              id: like.user.id,
              username: like.user.username,
              avatar: like.user.avatar,
            },
          },
          createdAt: new Date(),
        };

        const notification = await prisma.notification.create({
          data: notificationData,
        });

        const ownerSocketId = connectedUsers.get(like.post.userId);
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("notification", {
            ...notification,
            createdAt: notification.createdAt,
          });
        }
      }

      return res.status(201).json({ message: "Post liked successfully", like });
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ message: "Failed to like post" });
    }
  },
};

module.exports = postsController;
