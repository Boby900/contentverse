import request from "supertest";
import app from "../src/index.js";
import { expect, expectTypeOf, test, describe, it } from "vitest";
import { db } from "../src/db/index.js";
import { userTable } from "../src/db/schema.js";

describe("POST /auth/signup", () => {
    it("should successfully create a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };
  
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
  
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User registered successfully");
    });
}
)  