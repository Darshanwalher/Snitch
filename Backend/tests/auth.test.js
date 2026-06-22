import request from "supertest";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "@jest/globals";
import { app, setupDB, teardownDB, clearDB } from "./setup.js";

describe("Auth Integration Tests", () => {
    beforeAll(async () => {
        await setupDB();
    });

    afterAll(async () => {
        await teardownDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    const mockUser = {
        email: "test@example.com",
        password: "password123",
        fullname: "John Doe",
        contact: "1234567890",
        isSeller: false
    };

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(mockUser.email);
        expect(res.header["set-cookie"]).toBeDefined();
    });

    it("should reject registration with an existing email", async () => {
        // Register first user
        await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        // Try registering duplicate
        const res = await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("exist");
    });

    it("should login successfully with valid credentials", async () => {
        // Register first
        await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        // Login
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: mockUser.email,
                password: mockUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.header["set-cookie"]).toBeDefined();
    });

    it("should reject login with invalid credentials", async () => {
        // Register
        await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        // Try login with wrong password
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: mockUser.email,
                password: "wrongpassword"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("Invalid");
    });

    it("should retrieve profile of currently logged-in user", async () => {
        // Register and extract cookie
        const regRes = await request(app)
            .post("/api/auth/register")
            .send(mockUser);

        const cookie = regRes.header["set-cookie"];

        // Query profile endpoint with the token cookie
        const res = await request(app)
            .get("/api/auth/me")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(mockUser.email);
    });
});
