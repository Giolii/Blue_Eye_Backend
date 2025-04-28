const prisma = require("../config/prisma");
const { sanitizeUser, userFields } = require("../utils/sanitizeUser");

const postsController = {
  async fetchNotifications(req, res) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async readAllNotifications(req, res) {
    try {
      const notifications = await prisma.notification.updateMany({
        where: {
          userId: req.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async clearNotifications(req, res) {
    try {
      await prisma.notification.deleteMany({
        where: {
          userId: req.user.id,
        },
      });
      res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = postsController;
