const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL2,
  "http://localhost:5173",
].filter(Boolean); // Remove undefined values

module.exports = {
  express: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  },
  socket: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
};
