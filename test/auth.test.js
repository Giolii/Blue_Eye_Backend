const request = require("supertest");
const { createTestApp, cleanDatabase, generateToken } = require("./setup");
const authRoutes = require("../routes/authRoutes");
const prisma = require("../config/prisma");

describe("Auth Controller", () => {
  let user1, app, testUsers, guestUser;

  beforeAll(async () => {
    app = createTestApp();
    app.use("/auth", authRoutes);

    const guestUser = await request(app).post("/auth/register").send({
      email: "guest@guest.com",
      username: "Guest",
      password: "password123",
    });

    user1 = await prisma.user.create({
      data: {
        email: "gino@g.g",
        username: "gino11",
        password: "ax34jfg50x",
      },
    });
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe("POST /auth/register", () => {
    it("should create a new user successfully", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "newuser@example.com",
        username: "newuser",
        password: "password123",
      });

      expect(response.body).toHaveProperty("token");
      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe("newuser@example.com");
    });
  });
  it("should not allow duplicate emails", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "guest@guest.com",
      username: "differentuser",
      password: "password123",
    });
    expect(response.status).toBe(400);
  });

  describe("POST /auth/login", () => {
    it("should authenticate existing users", async () => {
      const response = await request(app).post("/auth/login").send({
        emailOrUsername: "guest@guest.com",
        password: "password123",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        emailOrUsername: "guest@guest.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });
  });
  describe("GET /auth/me", () => {
    it("should check user token", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${generateToken(user1.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
    });
    it("should return error if token is wrong", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${generateToken(user1.id) + "XYZ"}`);

      expect(response.status).toBe(401);
    });
  });
});
