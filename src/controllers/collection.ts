import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { collectionMetadataTable } from "../db/schema.js";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { fields } = req.body;
    const userId = req.user?.id;
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
    console.log("columns", columns);
    console.log("tableName", tableName);
    const createTableQuery = `
      CREATE TABLE ${tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${columns},
        "userId" INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE
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
