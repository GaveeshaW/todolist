const supertest = require("supertest");
const app = require('../server');
const mongoose = require('mongoose');
const Task = require('../models/Task');

let authToken = '';

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://127.0.0.1:27017/tasknest_test');
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("POST /api/signup", () => {
    it("should successfully create a new user and return a token", async() => {
        const res = await supertest(app).post("/api/signup").send({
            email: "testuser@example.com",
            password: "testpassword"
        });
        expect(res.status).toBe(201);
        authToken = res.body.token; // Save token for other tests
    });

    it("should return an error if the user already exists", async() => {
        const res = await supertest(app).post("/api/signup").send({
            email: "testuser@example.com",
            password: "testpassword"
        });
        expect(res.status).toBe(400);
        expect(res.text).toBe("User already exists");
    });

    it("should return an error if the password is missing", async() => {
        const res = await supertest(app).post("/api/signup").send({
            email: "missingpassword@example.com",
            password: ""
        });
        expect(res.status).toBe(400);
        expect(res.text).toBe("Password is required");
    });
});

describe("POST /api/login", () => {
    it("should successfully login and return a token", async() => {
        const res = await supertest(app)
            .post("/api/login")
            .send({
                email: "testuser@example.com",
                password: "testpassword"
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        authToken = res.body.token;
    });

    it("should return an error for invalid credentials", async() => {
        const res = await supertest(app).post("/api/login").send({
            email: "testuser@example.com",
            password: "wrongpassword"
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid email or password");
    });
});

describe("POST /api/tasks", () => {
    it("should create a new task when authenticated", async() => {
        const res = await supertest(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                description: "Test task",
                isImportant: true,
                isCompleted: false
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.description).toBe("Test task");
        expect(res.body.isImportant).toBe(true);
    });

    it("should return an error when creating a task without authentication", async() => {
        const res = await supertest(app)
            .post("/api/tasks")
            .send({
                description: "Test task without auth",
                isImportant: true,
                isCompleted: false
            });
        expect(res.status).toBe(403);
        expect(res.text).toBe("Token is missing");
    });
});

describe("GET /api/tasks", () => {
    it("should fetch tasks for the authenticated user", async() => {
        const res = await supertest(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return an error when fetching tasks without authentication", async() => {
        const res = await supertest(app).get("/api/tasks");
        expect(res.status).toBe(403);
        expect(res.text).toBe("Token is missing");
    });
});

describe("GET /api/tasks/deleted-tasks", () => {
    it("should fetch deleted tasks for the authenticated user", async () => {
        const res = await supertest(app)
            .get("/api/tasks/deleted-tasks")
            .set("Authorization", `Bearer ${authToken}`); // Use the token from login/signup tests
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        // If there are deleted tasks, check that they have the deleted flag set to true
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty("deleted", true);
        }
    });

    it("should return an error when fetching deleted tasks without authentication", async () => {
        const res = await supertest(app)
            .get("/api/tasks/deleted-tasks");
        expect(res.status).toBe(403); // Unauthorized due to missing token
        expect(res.text).toBe("Token is missing");
    });

    it("should handle errors when fetching deleted tasks", async () => {
        // Simulate an error in the Task.find method
        jest.spyOn(Task, 'find').mockRejectedValueOnce(new Error('Database error'));
        const res = await supertest(app)
            .get("/api/tasks/deleted-tasks")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(500); // Internal server error
        expect(res.body.message).toBe("Error fetching deleted tasks");
    });
});
