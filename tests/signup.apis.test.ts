import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { db } from "../src/db/index.js";
import { userTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

describe("test case for the signup endpoint", () => {
  const testEmail = "bobyt2265@gmail.com";

  beforeAll(async () => {
    // Remove only the test-created entries
    await db.delete(userTable).where(eq(userTable.email, testEmail));
  });

  afterAll(async () => {
    // Remove only the test-created entries
    await db.delete(userTable).where(eq(userTable.email, testEmail));
  });

  it("initial test", async () => {
    const payload = {
      email: testEmail,
      password: "bob@bob",
    };
    const response = await request(app).post("/api/auth/signup").send(payload);
    expect(response.body).toEqual({
      message: "User registered successfully",
    });
    expect(response.status).toBe(201);
  });
  it("should error out when either email or password is missing", async () => {
    const payload = {
      email: "",
      password: "bob@bob",
    };
    const response = await request(app).post("/api/auth/signup").send(payload);
    expect(response.body).toEqual({
      errors: ["Invalid email", "minimum length should be 5"],
      message: "Validation failed",
    });
    expect(response.status).toBe(400);
  });
  it("should fail when email is already registered", async () => {
    const payload = {
      email: "bobyt2265@gmail.com",
      password: "bob@bob",
    };

    // Simulate duplicate registration
    await request(app).post("/api/auth/signup").send(payload);

    const duplicateResponse = await request(app)
      .post("/api/auth/signup")
      .send(payload);

    expect(duplicateResponse.status).toBe(404);
    expect(duplicateResponse.body).toEqual({
      message: "User already exists",
    });
  });
});
