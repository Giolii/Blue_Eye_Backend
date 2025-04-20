const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { sanitizeUser } = require("../utils/sanitizeUser");
const randomAvatar = require("../utils/randomAvatar");

const authController = {
  // Sign Up
  async signup(req, res) {
    try {
      let { email, username, password } = req.body;

      email = email?.trim().toLowerCase();
      username = username?.trim();
      password = password?.trim();

      if (!email) return res.status(400).json({ message: "Email is required" });
      else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        return res
          .status(400)
          .json({ message: "Please provide a valid email address" });

      if (!username) errors.username = "Username is required";
      else if (username.length < 3)
        return res
          .status(400)
          .json({ message: "Username must be at least 3 characters" });

      if (!password)
        return res.status(400).json({ message: "Password is required" });
      else if (password.length < 5)
        return res
          .status(400)
          .json({ message: "Password must be at least 5 characters" });

      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const existingUsername = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      });

      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          password: hashedPassword,
          avatar: randomAvatar(),
        },
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({
        user: sanitizeUser(user),
        token,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error while signing up",
        message: error.message,
      });
    }
  },

  async login(req, res) {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: "Email/Username and password are required",
      });
    }
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
      });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Password doesn't match" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        user: sanitizeUser(user),
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error logging in", message: error.message });
    }
  },

  // Guest
  async guest(req, res) {
    try {
      if (req.user) {
        return res.status(403).json({ message: "You are logged in already" });
      }
      let user = await prisma.user.findUnique({
        where: {
          username: "Guest",
        },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "Guest",
            username: "Guest",
            avatar: randomAvatar(),
            email: "guest@guest.com",
            password: "xxxxxx",
          },
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({
        message: "Login successful",
        user: sanitizeUser(user),
      });
    } catch (error) {
      res.status(500).json({ error: "Error logging in", error: error.message });
    }
  },

  async authenticateMe(req, res) {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user found in request" });
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error during authentication", error: error.message });
    }
  },
  async logout(req, res) {
    res.clearCookie("jwt");
    res.json({ message: "Logout successful" });
  },
};

module.exports = authController;
