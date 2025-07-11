import { Response, Request } from "express";

import { db } from "../db/index.js";
import { and, inArray, sql } from "drizzle-orm";
import { collectionMetadataTable, userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
interface CollectionData {
  tableName: string;
  formData: {
    created: Date | null;
    description?: string;
    author?: string;
    category?: string;
  };
}

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { fields } = req.body;
    const userId = req.user?.id;
    if (!name || !fields || fields.length === 0 || !userId) {
      res.status(400).json({ error: "Name, userId and fields are required" });
      return;
    }
    const tableName = `collection_${name}_${userId}`;

    const existingTable = await db
      .select()
      .from(collectionMetadataTable)
      .where(
        and(
          eq(collectionMetadataTable.userId, userId),
          eq(collectionMetadataTable.tableName, tableName)
        )
      );
    if (existingTable.length > 0) {
      res.status(400).json({ error: `A Table named ${name} already exists` });
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

    // Check if table already exists

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
      selectedFields: JSON.stringify(fields), // Serialize the fields array
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

export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // User ID from authentication middleware
    console.log(req.user?.role);

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
    
    // Validate UUID format instead of converting to number
    if (!collectionID.match(/^[0-9a-fA-F-]{36}$/)) {
      res.status(400).json({ error: "Invalid UUID format" });
      return;
    }

    await db
      .delete(collectionMetadataTable)
      .where(
        and(
          eq(collectionMetadataTable.userId, userId),
          eq(collectionMetadataTable.id, collectionID)
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

export const deleteRowsOFCollection = async (req: Request, res: Response) => {
  try {
    const { ids, collectionName } = req.body;
    const userId = req.user?.id;

    if (!userId ) {
      res.status(400).json({ message: "Invalid request: userId or collectionId missing" });
      return;
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "Invalid request: No IDs provided for deletion" });
      return;
    }

    // Fetch the specific collection's table name
    const metadata = await db
      .select()
      .from(collectionMetadataTable)
      .where(
        and(
          eq(collectionMetadataTable.tableName, collectionName),
          eq(collectionMetadataTable.userId, userId),
        )
      );

    if (metadata.length === 0) {
      res.status(404).json({ message: "Collection not found for this user" });
      return;
    }

    const tableName = metadata[0].tableName; // Get the correct dynamic table name

    const deleteQuery = sql`
    DELETE FROM "${sql.raw(tableName)}"
    WHERE id IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)});
  `;

  const result = await db.execute(deleteQuery);

  console.log("Delete result:", result); // Debugging
res.status(200).json({ status: "success", message: "Collection deleted successfully" });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting rows" });
    
  }
};

export const getCollectionsByID = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // User ID from authentication middleware
    const collectionID = req.params?.id;
    const collectionIDAsNumber = Number(collectionID);
    if (isNaN(collectionIDAsNumber)) {
      res.status(400).json({ error: "Invalid collectionID format" });
      return;
    }

    if (!userId || !collectionID) {
      res.status(400).json({ error: "User ID and collectionID are required" });
      return;
    }

    // Validate UUID format instead of converting to number
    if (!collectionID.match(/^[0-9a-fA-F-]{36}$/)) {
      res.status(400).json({ error: "Invalid UUID format" });
      return;
    }

    // Use the UUID string directly
    const metadata = await db
      .select()
      .from(collectionMetadataTable)
      .where(
        and(
          eq(collectionMetadataTable.userId, userId),
          eq(collectionMetadataTable.id, collectionID)
        )
      );

    if (metadata.length === 0) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const collection = metadata[0]; // Get the first (and should be only) collection
    const tableName = collection.tableName; // Get the table name from metadata

    // Fetch data from the actual collection table
    const data = await db.execute(
      sql.raw(`
      SELECT *
      FROM "${tableName}"
      WHERE "userId" = '${userId}';
    `)
    );
    const tableData = data.rows;

    res.status(200).json({
      status: "success",
      tableData,
      metadata,
      message: "Fetched collection successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const insertCollectionData = async (req: Request, res: Response) => {
  try {
    const data: CollectionData = req.body;
    const userId = req.user?.id; // Assuming `req.user` is populated by authentication middleware
    const formData = data.formData;
    const tableName = data.tableName;

    if (!data || !userId) {
      res.status(400).json({ error: "Missing required fields or UserId" });
      return;
    }
    // Dynamically construct the query for inserting data
    const insertQuery = sql`
    INSERT INTO "${sql.raw(tableName)}" (${sql.join(
      Object.keys(formData).map((key) => sql.raw(`"${key}"`)),
      sql`, `
    )}, "userId")
    VALUES (${sql.join(
      [
        ...Object.values(formData).map((value) =>
          value === null ? sql.raw("NULL") : sql`${value}`
        ),
      ],
      sql`, `
    )}, ${sql`${userId}`});
  `;
    await db.execute(insertQuery);
    res.status(201).json({ message: "Collection data inserted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
