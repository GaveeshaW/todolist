const supertest = require("supertest"); //testing library
const app = require('../server'); //import server.js
const mongoose = require('mongoose'); //import mongoose
const Task = require('../models/Task'); //import Task.js

let authToken = '';

beforeAll(async () => { //before all should connect to mongodb
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://127.0.0.1:27017/tasknest_test');
    }
});

afterAll(async () => { //after the process, diconnect mongodb
    await mongoose.disconnect();
});

describe("POST /api/signup", () => { //inside this link
    it("should successfully create a new user and return a token", async() => { //have subparts to test out
        const res = await supertest(app).post("/api/signup").send({
            email: "testuser@example.com",
            password: "testpassword"
        });
        expect(res.status).toBe(201);
        authToken = res.body.token; 
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
            .set("Authorization", `Bearer ${authToken}`); 
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty("deleted", true);
        }
    });

    it("should return an error when fetching deleted tasks without authentication", async () => {
        const res = await supertest(app)
            .get("/api/tasks/deleted-tasks");
        expect(res.status).toBe(403); 
        expect(res.text).toBe("Token is missing");
    });
});

describe("PUT /api/tasks/:id", () => {
    let taskId;
    const invalidTaskId = "xyz";

    beforeAll(async () => {
        const taskRes = await supertest(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Initial task", isImportant: false, isCompleted: false });
        taskId = taskRes.body._id; 
    });

    it("should update the task successfully", async () => {
        const res = await supertest(app)
            .put(`/api/tasks/${taskId}`) 
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Updated task description" });
        
        expect(res.status).toBe(200);
        expect(res.body.description).toBe("Updated task description");
    });

    it("should return 400 for an invalid task ID", async () => {
        const res = await supertest(app)
            .put(`/api/tasks/${invalidTaskId}`) 
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Updated task description" });
    
        expect(res.status).toBe(400);
        expect(res.text).toBe("Invalid task ID format");
    });    
});

describe("PUT /api/tasks/:id/delete", () => {
    let taskId;

    beforeAll(async () => {
        const taskRes = await supertest(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Task to delete", isImportant: false, isCompleted: false });
        taskId = taskRes.body._id;
    });

    it("should soft delete a task successfully", async() => {
        const res = await supertest(app)
            .put(`/api/tasks/${taskId}/delete`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body.deleted).toBe(true);
        expect(res.body.description).toBe("Task to delete");
    });

    it("should display error message if an error occurs while deleting the task", async() => {
        jest.spyOn(Task, 'findOneAndUpdate').mockImplementationOnce(() => {
            throw new Error("Database error");
        });
        const res = await supertest(app)
            .put(`/api/tasks/${taskId}/delete`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Error deleting task");
    });
});

describe("PUT /api/tasks/:id/restore", () => {
    let taskId;

    beforeAll(async () => {
        const taskRes = await supertest(app)
            .put("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Task to delete", isImportant: false, isCompleted: false });
        taskId = taskRes.body._id;

        await supertest(app)
            .put(`/api/tasks/${taskId}/delete`)
            .set("Authorization", `Bearer ${authToken}`);
    });

    it("should display error message if an error occurs while restoring the task", async() => {
        jest.spyOn(Task, 'findOneAndUpdate').mockImplementationOnce(() => {
            throw new Error('Database error');
        });
        const res = await supertest(app)
            .put(`/api/tasks/${taskId}/restore`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error restoring task');
        Task.findOneAndUpdate.mockRestore();
    });
});