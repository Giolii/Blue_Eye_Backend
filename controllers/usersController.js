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
};

module.exports = usersController;
