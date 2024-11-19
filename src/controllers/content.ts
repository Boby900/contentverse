import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { contentTable } from "../db/schema.js";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export const createContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, userId } = req.body;

  try {
    if (!title || !userId) {
     res.status(400).json({
        status: "fail",
        message: "Title and userId are required",
      });
      return 
    }

    const data = await db.insert(contentTable).values({
      id: randomUUID(), // Generate a unique ID
      title: title,
      userId: userId,
    });
    res.status(201).json({
      status: "success",
      message: "Content created successfully",
      data: data,
    });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while creating content",
      error: error,
    });
  }
};

export const getAllContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = await db.select().from(contentTable);

  console.log(data);
  res.status(201).send("Hello getAllContent!");
};

export const getContentByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const data = await db
    .select()
    .from(contentTable)
    .where(eq(contentTable.id, id));
  console.log(data);
};

export const updateContentByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.params);
  res.status(201).send("Hello updateContentByID!");
};
export const deleteContentByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const data = await db.delete(contentTable).where(eq(contentTable.id, id));
  if (data.rowCount == 1) {
    console.log("deleted...");
  } else {
    console.log("error while deleting.");
  }
};
