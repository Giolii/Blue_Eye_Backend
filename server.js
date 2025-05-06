require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const corsConfig = require("./config/cors");
const socketAuthMiddleware = require("./config/socketAuth");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsConfig.socket,
});

const connectedUsers = new Map();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors(corsConfig.express));

// Make io and connectedUsers available to routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

require("./config/passport");

// Socket.IO authentication
io.use(socketAuthMiddleware);

io.on("connection", require("./config/socketHandler")(connectedUsers));

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});
app.use("/auth", require("./routes/authRoutes"));
app.use("/posts", require("./routes/postsRoutes"));
app.use("/users", require("./routes/usersRoutes"));
app.use("/upload", require("./routes/uploadRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));

app.use(require("./middleware/errorHandler"));

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = { app };
