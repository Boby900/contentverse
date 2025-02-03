import { Response, Request } from "express";
import { db } from "../db/index.js";
import { collectionMetadataTable, userTable } from "../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";

export const getAllUsers = async (res: Response) => {
  try {
    const data = await db.select().from(userTable);
    if (!data.length) {
      res.status(404).json({
        status: "fail",
        message: `Users not found`,
      });
    }
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: data,
    });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching users",
      error: error,
    });
  }
};

export const getUserByID = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    console.log(req.user);
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, req.user.id))
      .limit(1);
    if (!user.length) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Content fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching user by ID",
      error: error,
    });
  }
};

export const deleteUserByID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Example: "ed0d13f3-917e-4910-acc3-075a7adf1495,1a1ebf84-23f4-4b45-935a-338856f426c4"

    // Convert `id` string into an array of UUIDs
    const idArray = id.split(",").map((uuid) => uuid.trim());

    if (idArray.some((uuid) => !uuid.match(/^[0-9a-fA-F-]{36}$/))) {
      res.status(400).json({
        status: "fail",
        message: "Invalid UUID format",
      });
      return;
    }
    // Fetch tables to drop
    const tablesToDelete = await db
      .select({ tableName: collectionMetadataTable.tableName })
      .from(collectionMetadataTable)
      .where(inArray(collectionMetadataTable.userId, idArray));

    for (const table of tablesToDelete) {
      const dropTableQuery = `DROP TABLE IF EXISTS "${table.tableName}" CASCADE;`;
      await db.execute(sql.raw(dropTableQuery));
    }

    // Delete users where ID matches any UUID in the array
    const deletedUsers = await db
      .delete(userTable)
      .where(inArray(userTable.id, idArray))
      .returning({ deletedId: userTable.id });

    if (!deletedUsers.length) {
      res.status(404).json({
        status: "fail",
        message: `Users with provided IDs not found`,
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Users deleted successfully",
      deleted: deletedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while deleting users",
      error: error,
    });
  }
};
