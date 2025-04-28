const jwt = require("jsonwebtoken");
const prisma = require("./prisma");
const { sanitizeUser } = require("../utils/sanitizeUser");

// Socket.IO authentication middleware that uses your existing logic
const socketAuthMiddleware = async (socket, next) => {
  try {
    // Extract cookies from socket.handshake
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      socket.user = null;
      return next();
    }

    // Parse cookies manually (similar to your cookieExtractor)
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies.jwt;
    if (!token) {
      socket.user = null;
      return next();
    }

    // Verify JWT (using your existing JWT_SECRET)
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user in database (just like your passport strategy)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (user) {
      // Attach sanitized user to socket
      socket.user = sanitizeUser(user);
    } else {
      socket.user = null;
    }

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    socket.user = null;
    next();
  }
};

module.exports = socketAuthMiddleware;
