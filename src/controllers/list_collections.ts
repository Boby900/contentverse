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
  
      // Fetch all collections created by the user
      const collections = await db
        .select()
        .from(collectionMetadataTable)
        .where(eq(collectionMetadataTable.userId, userId));
  
      res.status(200).json({
        status: "success",
        collections,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  };
  