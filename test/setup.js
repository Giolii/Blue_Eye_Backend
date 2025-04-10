const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const cookieParser = require("cookie-parser");

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  require("../config/passport");
  app.use(passport.initialize());
  return app;
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

const cleanDatabase = async () => {
  // await prisma.message.deleteMany({});
  // await prisma.userConversation.deleteMany({});
  // await prisma.conversation.deleteMany({});
  await prisma.user.deleteMany({});
};

beforeAll(async () => {
  // Make sure we're using the test database
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL environment variable is not set");
  }
  if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL cannot be the same as DATABASE_URL");
  }

  // Clean database before all tests
  // await cleanDatabase();
});

afterAll(async () => {
  // Clean up and disconnect after all tests
  await cleanDatabase();
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  createTestApp,
  cleanDatabase,
  generateToken,
};
