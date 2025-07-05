import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: "https://2b5616548f5a0d6d5c619d78a6101aaa.r2.cloudflarestorage.com", // Replace with your account IDs
  credentials: {
    accessKeyId: process.env.CF_TOKEN!,
    secretAccessKey: process.env.CF_SECRET!, // Add this to your .env if not already
  },
});