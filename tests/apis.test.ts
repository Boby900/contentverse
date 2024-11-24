import request from "supertest";
import app from "../src/index.js";
import { expect, test, describe, it } from "vitest";
import { db } from "../src/db/index.js";
import { userTable } from "../src/db/schema.js";

//   describe('POST /logout', () => {
//     it('should log out successfully', async () => {
//       const response = await request(app)
//         .post('/logout')
//         .send({ sessionToken: 'token123' });

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({ message: 'Logout successful.' });
//     });

//     it('should return a 400 error if session token is missing', async () => {
//       const response = await request(app).post('/logout').send({});

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'Session token is required.' });
//     });
//   });

describe("GET /", () => {
  it("should get home page", async () => {
    const response = await request(app).get("/api/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World!" });
  });
});

describe("GET /content", () => {
  it("should get all the contents", async () => {
    const response = await request(app).get("/api/content");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World!" });
  });

  it("should return 400 if required query parameters are missing", async () => {
    const response = await request(app).get("/api/content?missingParam=true"); // Simulate a bad request

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "fail");
    expect(response.body).toHaveProperty(
      "message",
      "Token validation failed"
    );
  });
});
