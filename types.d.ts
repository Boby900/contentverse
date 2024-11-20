import { Request } from "express";
import type { Session, User } from "./src/db/schema";
// Create new types omitting sensitive fields

export type CustomUser = Omit<User, "password">;

// Extend Express Request type globally
declare global {
  namespace Express {
    export interface Request {
      session?: Session;
      user?: CustomUser;
    }
  }
}
