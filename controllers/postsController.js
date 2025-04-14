const prisma = require("../config/prisma");
const { sanitizeUser, userFields } = require("../utils/sanitizeUser");

const postsController = {
  async createPost(req, res) {
    const content = req.body.content.trim();
    const userId = req.user.id;

    if (!content) {
      return res
        .status(400)
        .json({ message: "You need to provide some content" });
    }
    try {
      const post = await prisma.post.create({
        data: {
          content,
          userId,
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
        },
      });

      const totalPosts = await prisma.post.count({
        where: { userId },
      });

      const hasMore = skip + posts.length < totalPosts;

      return res.status(200).json({
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
};

module.exports = postsController;
