const request = require("supertest");
const {
  createTestApp,
  cleanDatabase,
  generateToken,
  testUsers,
} = require("./setup");
const authRoutes = require("../routes/authRoutes");

describe("Auth Controller", () => {
  let app, users;

  beforeAll(async () => {
    app = createTestApp();
    app.use("/auth", authRoutes);
    users = await testUsers();
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
    });
  });
  it("should not allow duplicate emails", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "newuser@example.com",
      username: "differentuser",
      password: "password123",
    });
    expect(response.status).toBe(400);
  });

  describe("POST /auth/login", () => {
    it("should authenticate existing users", async () => {
      let fakeUser = {
        email: "newuser2@example.com",
        username: "differentuser2",
        password: "password123",
      };

      await request(app).post("/auth/register").send({
        email: fakeUser.email,
        username: fakeUser.username,
        password: fakeUser.password,
      });

      const response = await request(app).post("/auth/login").send({
        emailOrUsername: fakeUser.email,
        password: fakeUser.password,
      });
      expect(response.status).toBe(200);
    });
    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        emailOrUsername: users.user1.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });
  });
  describe("GET /auth/me", () => {
    it("should check user authentication from cookie", async () => {
      const user = await request(app).post("/auth/register").send({
        email: "usertoken@c.com",
        username: "usertoken",
        password: "jkl143hjhg562j43",
      });

      const token = generateToken(user.body.user.id);

      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
    });
    it("should return error if token is wrong", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`12345678`]);

      expect(response.status).toBe(401);
    });
  });
});
