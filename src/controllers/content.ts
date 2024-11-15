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
    const data = await db.insert(contentTable).values({
      id: randomUUID(), // Generate a unique ID
      title: title,
      userId: userId,
    });
    res.status(201).send("Hello createContent!");
  } catch (error) {
    console.log(error);
    res.status(401).send("error while calling this endpoint!");
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
  const { id } = req.body;

  const data = await db
    .select()
    .from(contentTable)
    .where(eq(contentTable.id, id));
  console.log(data);
  res.status(201).send("Hello getContentByID!");
};

export const updateContentByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  res.status(201).send("Hello updateContentByID!");
};
export const deleteContentByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body;

  const data = await db.delete(contentTable).where(eq(contentTable.id, id));
  if (data.rowCount == 1) {
    console.log("deleted...");
    res.status(201).send("Hello deleteContentByID!");
  } else {
    res.status(401).send("error while deleting.");
  }
};
