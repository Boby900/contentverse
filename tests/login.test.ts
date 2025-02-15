import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { db } from "../src/db/index.js";
import { sessionTable, userTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

describe("test case for the login endpoint", () => {
  const testEmail = "testuser@gmail.com";
  const testPassword = "testpassword"; // Add a test password

  beforeAll(async () => {
    // Remove only the test-created entries
    await db.delete(userTable).where(eq(userTable.email, testEmail));

    // Create a test user
    const hashedPassword = encodeHexLowerCase(
      sha256(new TextEncoder().encode(testPassword))
    );
    await db.insert(userTable).values({
      email: testEmail,
      password: hashedPassword,
    });
  });
  afterAll(async () => {
    // Remove only the test-created entries
    await db.delete(userTable).where(eq(userTable.email, testEmail));
  });

  it("should throw the error if the email or password is wrong", async () => {
    const payload = {
      email: testEmail,
      password: "bobisbob",
    };
    const response = await request(app).post("/api/auth/login").send(payload);
    expect(response.body).toEqual({
      message: "Invalid email or password",
    });
    expect(response.status).toBe(401);
  });
  it("should throw the zod error if the email or password is missing", async () => {
    const payload = {
      email: "",
      password: "bob@bob",
    };
    const response = await request(app).post("/api/auth/login").send(payload);
    expect(response.body).toEqual({
      errors: ["Invalid email", "minimum length should be 5"],
      message: "Validation failed",
    });
    expect(response.status).toBe(400);
  });

  it("should successfully login a user and create a session", async () => {
    const payload = {
      email: testEmail,
      password: testPassword,
    };
    const response = await request(app).post("/api/auth/login").send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Logged in successfully",
    });

    // Verify the user is created in the database
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, testEmail));
    expect(users.length).toBe(1);

    // Verify the session is created in the database
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.userId, users[0].id));
    expect(sessions.length).toBeGreaterThanOrEqual(1);
  });
});
