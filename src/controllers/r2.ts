import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2";

export const uploadToR2 = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const bucket = "<your-bucket-name>"; // Replace with your R2 bucket name
  const key = req.file.originalname; // Or generate a unique name

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );
    res.status(200).json({ message: "File uploaded successfully", key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};