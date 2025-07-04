import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: "https://<your-account-id>.r2.cloudflarestorage.com", // Replace with your account ID
  credentials: {
    accessKeyId: process.env.CF_TOKEN!,
    secretAccessKey: process.env.CF_SECRET!, // Add this to your .env if not already
  },
});