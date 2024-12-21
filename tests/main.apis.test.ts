import request from "supertest";
import app from "../src/index.js";
import { expect, expectTypeOf, test, describe, it } from "vitest";
import { db } from "../src/db/index.js";
import { userTable } from "../src/db/schema.js";

describe("GET /", () => {
  it("should get home page", async () => {
    const response = await request(app).get("/api/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World!" });
  });
});

describe("GET /dashboard", () => {
  it("should get all the contents", async () => {
    const response = await request(app).get("/api/dashboard");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello Dashboard!" });
  });
});

