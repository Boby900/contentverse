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
  const { title, userId} = req.body;

  try {
    const data = await db.insert(contentTable).values({
      id: randomUUID(), // Generate a unique ID
      title: title,
      userId: userId,
    });
  
    
  } catch (error) {
    console.log(error);
   
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
    console.log("error while deleting.")
  }
};
