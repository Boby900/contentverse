import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { contentTable, mediaTable } from "../db/schema.js";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import dotenv from "dotenv"
import { PinataSDK } from "pinata";
import fs  from "fs";



// import { Blob } from "buffer";

// require("dotenv").config()
dotenv.config();
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})


const contentSchema = z.object({
  title: z.string().min(5),
  userId: z.string(),
});


export const createContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const { title, userId } = contentSchema.parse(req.body);
    await db.insert(contentTable).values({
      id: randomUUID(), // Generate a unique ID
      title: title,
      userId: userId,
    });
    res.status(201).json({
      status: "success",
      message: "Content created successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
     
      res.status(400).json({
        status: "fail",
        errors: error.errors, // Include detailed validation errors
      });
    }
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
  try {
    const data = await db.select().from(contentTable);
    if (!data.length) {
      res.status(404).json({
        status: "fail",
        message: `Content not found`,
      })}
    res.status(200).json({
      status: "success",
      message: "Content fetched successfully",
      data: data,
    });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching content",
      error: error,
    });
  }
};

export const getContentByID = async (
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

export const updateContentByID = async (
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
export const deleteContentByID = async (
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
export const uploadFile = async(
  req: Request,
  res: Response,
  next: NextFunction) =>{
    try {
      const blob = new Blob([fs.readFileSync('bob.txt')]);
      const file = new File([blob], "bob.txt", { type: "text/plain"})
      const upload = await pinata.upload.file(file);
      console.log(upload)
      const { userId } = req.body;
    await db.insert(mediaTable).values({
      id: randomUUID(),
      userId: userId,
      pinata_id: upload.id,
      cid: upload.cid,
      mime_type: upload.mime_type,
      user_pinata_id: upload.user_id
    });
    res.status(201).json({
      status: "success",
      message: "Content uploaded successfully",
    });
 
    } catch (error) {
      console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching content",
      error: error,
    });
    }
  }
