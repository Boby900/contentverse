import { Request, Response } from "express";
import { collectionMetadataTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
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
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};
