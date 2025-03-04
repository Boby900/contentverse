import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";
import { config } from "dotenv";
config({ path: ".env" }); // or .env.local
// uncommenting above lines will cause the error
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
