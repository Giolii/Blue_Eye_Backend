const prisma = require("../config/prisma");
const { sanitizeUser, userFields } = require("../utils/sanitizeUser");

const usersController = {
  async fetchUserById(req, res) {
    const userId = req.params.id;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      return res.status(200).json(sanitizeUser(user));
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "User not found" });
      }
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed  fetching user" });
    }
  },

  async updateAvatar(req, res) {
    const userId = req.params.id;
    const { avatarLink } = req.body;

    if (userId !== req.user.id) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    if (!avatarLink) {
      return res
        .status(403)
        .json({ message: "You need to provide an image link" });
    }

    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: avatarLink,
        },
      });
      return res.status(200).json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed  updating user" });
    }
  },

  async updateName(req, res) {
    const userId = req.params.id;
    const { newName } = req.body;

    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: newName,
        },
      });
      return res.status(200).json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed  updating user" });
    }
  },

  async followUser(req, res) {
    const userIdToFollow = req.params.userId;

    if (userIdToFollow === req.user.id) {
      return res.status(403).json({ message: "You can't follow yourself" });
    }
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");
    try {
      const response = await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId: userIdToFollow,
        },
        include: {
          follower: {
            select: userFields,
          },
          following: {
            select: userFields,
          },
        },
      });
      console.log(response);

      // ok

      const notificationData = {
        userId: response.followingId,
        type: "USER_FOLLOW",
        message: `${response.follower.username} started following you`,
        data: {
          sentBy: {
            id: response.follower.id,
            username: response.follower.username,
            avatar: response.follower.avatar,
          },
        },
        createdAt: new Date(),
      };

      const notification = await prisma.notification.create({
        data: notificationData,
      });

      const ownerSocketId = connectedUsers.get(response.followingId);
      if (ownerSocketId) {
        io.to(ownerSocketId).emit("notification", {
          ...notification,
          createdAt: notification.createdAt,
        });
      }

      // ok

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async unfollowUser(req, res) {
    const userIdToUnfollow = req.params.userId;

    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ error: "Unauthorized. User not authenticated." });
      }

      const response = await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: userIdToUnfollow,
          },
        },
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async fetchFollowers(req, res) {
    const userId = req.params.userId;

    try {
      const followers = await prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
            select: userFields,
          },
        },
      });

      const following = await prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: {
            select: userFields,
          },
        },
      });

      const followerCount = followers.length;
      const followingCount = following.length;

      const response = {
        followers,
        following,
        followerCount,
        followingCount,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = usersController;
