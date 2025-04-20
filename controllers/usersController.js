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
};

module.exports = usersController;
