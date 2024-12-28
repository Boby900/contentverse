import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { contentTable, userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z, ZodError } from "zod";



const contentSchema = z.object({
  title: z.string().min(5),
  userId: z.number(),
});



export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await db.select().from(userTable);
    if (!data.length) {
      res.status(404).json({
        status: "fail",
        message: `Users not found`,
      })}
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

export const getUserByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await db
      .select()
      .from(contentTable)
      .where(eq(contentTable.id, id));
      if (!data.length) {
        res.status(404).json({
          status: "fail",
          message: `Content with ID ${id} not found`,
        })
      return
      };
    res.status(200).json({
      status: "success",
      message: "Content fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching content",
      error: error,
    });
  }
};

export const updateUserByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validData = contentSchema.partial({
      userId: true
    })
    const { id } = req.params;
    const { title } =  validData.parse(req.body);
    
    
    const data = await db
      .update(contentTable)
      .set({"title": title })
      .where(eq(contentTable.id, id))
      .returning();
 
      if (!data.length) {
        res.status(404).json({
          status: "fail",
          message: `Content with ID ${id} not found`,
        })
      return
      };
    res.status(200).json({
      status: "success",
      message: "Content updated successfully",
      data: data,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
     

    res.status(400).json({
        status: "fail",
        errors: error.errors, // Include detailed validation errors
      });
      return

     

    }
    res.status(500).json({
      status: "error",
      message: "Internal server error while creating content",
      error: error,
    });
    
  }
};
export const deleteUserByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await db.delete(contentTable).where(eq(contentTable.id, id));
    if (data.rowCount !==1) {
      res.status(404).json({
        status: "fail",
        message: `Content with id ${id} not found`,
      })}
    if (data.rowCount == 1) {
      res.status(200).json({
        status: "success",
        message: "Content deleted successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching content",
      error: error,
    });
  }
};
