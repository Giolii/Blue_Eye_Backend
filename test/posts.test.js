const request = require("supertest");
const {
  createTestApp,
  cleanDatabase,
  generateToken,
  testUsers,
} = require("./setup");
const postsRoutes = require("../routes/postsRoutes");

describe("Posts Controller", () => {
  let app, users;

  beforeAll(async () => {
    app = createTestApp();
    app.use("/posts", postsRoutes);
    users = await testUsers();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe("POST /posts/", () => {
    it("should create a new post", async () => {
      const token = generateToken(users.user1.id);

      const response = await request(app)
        .post("/posts/")
        .set("Cookie", [`jwt=${token}`])
        .send({
          content: "Content of a new post",
        });

      expect(response.status).toBe(201);
    });
  });
  describe("DELETE /:id", () => {
    it("should  delete a post", async () => {
      const token = generateToken(users.user1.id);

      const response = await request(app)
        .post("/posts/")
        .set("Cookie", [`jwt=${token}`])
        .send({
          content: "New post to delete",
        });

      const deletePost = await request(app)
        .post(`/${response.body.post.id}`)
        .set("Cookie", [`jwt=${token}`]);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("post");
    });
  });
  describe("GET /", () => {
    it("should  fetch all posts", async () => {
      const token = generateToken(users.user1.id);

      const response = await request(app)
        .get("/posts/")
        .set("Cookie", [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("posts");
    });
  });
  describe("PUT /", () => {
    it("should  edit a post", async () => {
      const token = generateToken(users.user1.id);
      const post = users.post1;

      const response = await request(app)
        .put(`/posts/${post.id}`)
        .set("Cookie", [`jwt=${token}`])
        .send({
          content: "New Post 1 edit",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("post");
      expect(response.body.post.content).toBe("New Post 1 edit");
    });
  });
  describe("GET /users/:id", () => {
    it("should  fetch user's post", async () => {
      const token = generateToken(users.user1.id);

      const response = await request(app)
        .get(`/posts/users/${users.user1.id}`)
        .set("Cookie", [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("posts");
    });
  });
});
