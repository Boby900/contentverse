import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { db } from "../src/db/index.js";
import {
  collectionMetadataTable,
  userTable,
  sessionTable,
} from "../src/db/schema.js";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  generateSessionToken,
  createSession,
} from "../src/controllers/auth.js"; // Import auth functions
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

// Test user credentials
const testUserEmail = `test${randomUUID()}@example.com`;
const testUserPassword = "testpassword";
let testUserId: string;
let testSessionToken: string;

// Sample collection name for testing
const testCollectionName = `test_collection`;

describe("Collection API Endpoints (with Authentication)", () => {
  // Before all tests, create a test user, log them in, and get a session token
  beforeAll(async () => {
    // 1. Create a test user
    const hashedPassword = encodeHexLowerCase(
      sha256(new TextEncoder().encode(testUserPassword))
    );
    const newUser = await db
      .insert(userTable)
      .values({ email: testUserEmail, password: hashedPassword })
      .returning({ id: userTable.id });
    testUserId = newUser[0].id;

    // 2. Generate a session token and create a session
    testSessionToken = generateSessionToken();
    await createSession(testSessionToken, testUserId);

    // Clear existing collections for the test user
    await db
      .delete(collectionMetadataTable)
      .where(eq(collectionMetadataTable.userId, testUserId));
  });

  // After all tests, clean up the test collection, user, and session
  afterAll(async () => {
    // Drop the table

    const testTableName = `collection_${testCollectionName}_${testUserId}`;
    console.log(`Attempting to drop table "${testTableName}"`);
    try {
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${testTableName}"`));
      console.log(`Table "${testTableName}" dropped successfully`);
    } catch (error) {
      console.error(`Error dropping table "${testTableName}":`, error);
    }
    try {
        // Clean up the test collection metadata
        await db
          .delete(collectionMetadataTable)
          .where(eq(collectionMetadataTable.userId, testUserId));
        console.log("Collection metadata deleted successfully");
      } catch (error) {
        console.error("Error deleting collection metadata:", error);
      }
  

      try {
        // Clean up the test session
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(testSessionToken))
        );
        await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
        console.log("Session deleted successfully");
      } catch (error) {
        console.error("Error deleting session:", error);
      }

    try {
        // Clean up the test user
        await db.delete(userTable).where(eq(userTable.id, testUserId));
        console.log("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
  });

  describe("POST /api/collection", () => {
    it("should create a new collection successfully with a valid session token", async () => {
      const response = await request(app)
        .post("/api/collection")
        .set("Content-Type", "application/json")
        .set("Cookie", `session=${testSessionToken}`) // Send session token as a cookie
        .send({
          name: testCollectionName,
          fields: ["description", "author"],
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: "success",
        message: "Collection created successfully",
      });

      // Verify that the collection metadata was created in the database
      const collections = await db
        .select()
        .from(collectionMetadataTable)
        .where(eq(collectionMetadataTable.userId, testUserId));

      expect(collections.length).toBe(1);
      expect(collections[0].tableName).toBe(
        `collection_${testCollectionName}_${testUserId}`
      );
      expect(JSON.parse(collections[0].selectedFields)).toEqual([
        "description",
        "author",
      ]);
    });

    it("should return an error if no session token is provided", async () => {
      const response = await request(app)
        .post("/api/collection")
        .set("Content-Type", "application/json")
        .send({
          name: testCollectionName,
          fields: ["description", "author"],
        });

      expect(response.status).toBe(401); // Expect 401 Unauthorized
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Token validation failed");
    });

    it("should return an error if name or fields is missing", async () => {
      const response = await request(app)
        .post("/api/collection")
        .set("Content-Type", "application/json")
        .set("Cookie", `session=${testSessionToken}`) // Send session token as a cookie
        .send({}); // Missing name and fields

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Name, userId and fields are required",
      });
    });

    it("should return an error if a table with the same name already exists", async () => {
      // First, create a collection
      await request(app)
        .post("/api/collection")
        .set("Content-Type", "application/json")
        .set("Cookie", `session=${testSessionToken}`) // Send session token as a cookie
        .send({
          name: testCollectionName,
          fields: ["description", "author"],
        });

      // Then, try to create another collection with the same name
      const response = await request(app)
        .post("/api/collection")
        .set("Content-Type", "application/json")
        .set("Cookie", `session=${testSessionToken}`) // Send session token as a cookie
        .send({
          name: testCollectionName,
          fields: ["description", "author"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: `A Table named ${testCollectionName} already exists`,
      });
    });
  });

  describe("GET /api/collection/get_collections", () => {
    it("should return an error if no session token is provided", async () => {
      const response = await request(app).get(
        "/api/collection/get_collections?page=1"
      );

      expect(response.status).toBe(401); // Expect 401 Unauthorized
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Token validation failed");
    });
  });
});
