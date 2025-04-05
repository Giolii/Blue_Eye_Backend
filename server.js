require("dotenv").config();
const express = require("express");
const passport = require("passport");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

// Routes
const authRoutes = require("./routes/authRoutes");

require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());

const corsOptions = {
  origin: [process.env.VITE_FRONTEND_URL, process.env.VITE_FRONTEND_URL2],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Use Routes
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
