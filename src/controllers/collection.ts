import { Response, Request, NextFunction } from "express";
import { uuid } from "drizzle-orm/pg-core";

import { db } from "../db/index.js";
import { and, sql } from "drizzle-orm";
import { collectionMetadataTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { fields } = req.body;
    const userId = req.user?.id;
    console.log(name, fields, userId)
    if (!name || !fields || fields.length === 0 || !userId) {
      res.status(400).json({ error: "Name, userId and fields are required" });
      return;
    }

    const columns = fields
      .map((field: string) => {
        switch (field) {
          case "created":
            return `"${field}" TIMESTAMP DEFAULT NOW()`;
          case "description":
            return `"${field}" TEXT`;
          case "author":
            return `"${field}" TEXT`;
          case "category":
            return `"${field}" TEXT`;
          default:
            throw new Error(`Unsupported field: ${field}`);
        }
      })
      .join(", ");
    const tableName = `collection_${name}_${userId}`;

    const createTableQuery = `
      CREATE TABLE "${tableName}" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${columns},
        "userId" uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE
      );
    `;

    // Execute the query using raw SQL
    await db.execute(sql.raw(createTableQuery));
    await db.insert(collectionMetadataTable).values({
      userId,
      tableName,
    });
    res.status(201).json({
      status: "success",
      message: "Collection created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
// Construct the CREATE TABLE query

// Respond with success
export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // User ID from authentication middleware

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Parse `page` and `limit` query parameters
    const page = parseInt(req.query.page as string, 10) || 1;
    if (page < 1) {
      res.status(400).json({ error: "Page must be a positive integer" });
      return;
    }

    const limit = 2; // Fixed limit of 2 items per page
    const offset = (page - 1) * limit;

    // Fetch all collections created by the user
    const collections = await db
      .select()
      .from(collectionMetadataTable)
      .where(eq(collectionMetadataTable.userId, userId))
      .limit(limit)
      .offset(offset);

    // Get the total count of collections for pagination info
    const totalCollections = await db
      .select()
      .from(collectionMetadataTable)
      .where(eq(collectionMetadataTable.userId, userId));

    const total = totalCollections.length || 0;

    res.status(200).json({
      status: "success",
      collections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
export const deleteCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // User ID from authentication middleware
    const collectionID = req.params?.id;
    if (!userId || !collectionID) {
      res.status(400).json({ error: "User ID and collectionID is required" });
      return;
    }
    const collectionIDAsNumber = parseInt(collectionID, 10); // Adjust type conversion based on schema
    if (isNaN(collectionIDAsNumber)) {
      res.status(400).json({ error: "Invalid collectionID format" });
      return;
    }
    await db
      .delete(collectionMetadataTable)
      .where(
        and(
          eq(collectionMetadataTable.userId, userId),
          eq(collectionMetadataTable.id, collectionIDAsNumber)
        )
      );

    res.status(200).json({
      status: "success",
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
