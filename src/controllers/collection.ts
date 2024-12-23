import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const createCollection = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name } = req.body;
    const { fields } = req.body;

    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({ error: "Name and fields are required" });
    }

    console.log("name:", name);
    console.log("fields:", fields);

    const columns = fields
      .map((field: string) => {
        switch (field) {
          case "created":
            return `"${field}" TIMESTAMP DEFAULT NOW()`;
          case "userId":
            return `"${field}" INTEGER NOT NULL`;
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
    const tableName = `collection_${name}`;
      console.log("columns",columns)
      console.log("tableName",tableName)
  const createTableQuery = `
      CREATE TABLE ${tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${columns}
      );
    `;

    console.log("Generated SQL:", createTableQuery);

    // Execute the query using raw SQL
    await db.execute(sql.raw(createTableQuery));
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