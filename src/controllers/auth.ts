import type { Session, User } from "../db/schema.js";
import { sessionTable, userTable } from "../db/schema.js";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { Response, Request, NextFunction } from "express";
import { ipFailureTable } from "../db/schema.js";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

import { sha256 } from "@oslojs/crypto/sha2";
import crypto from "crypto";
import { z, ZodError } from "zod";
import { setSessionTokenCookie, deleteSessionTokenCookie } from "./cookies.js";
import { sendEmailAlert } from "../lib/mailNodeMailer.js";
import { sendVerificationEmail } from "./email-verification.js";
const signupSchema = z.object({
  email: z.string().email().min(5, "minimum length should be 5"),
  password: z.string().min(5, "minimum length should be 5"),
});

export const signupHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    if (existingUser.length >= 1) {
      res.status(404).send({ message: "User already exists" });
      return;
    } else {
      // // Hash password (implement hashing logic with oslojs or other)
      const hashedPassword = encodeHexLowerCase(
        sha256(new TextEncoder().encode(password))
      );
      // // Insert user into database

      const newUser = await db
        .insert(userTable)
        .values({ email, password: hashedPassword })
        .returning({ id: userTable.id });
        await sendVerificationEmail(req, res); // Pass req and res
        const token = generateSessionToken();
      const session = await createSession(token, newUser[0].id);
      if (!session) {
        res.status(500).json({ message: "Failed to create session" });
        return;
      }
      setSessionTokenCookie(res, token, session.expiresAt);
      res.status(201).json({ message: "User registered successfully" });

      return;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const customMessages = error.errors.map((err) => err.message);

      res.status(400).json({
        message: "Validation failed",
        errors: customMessages, // Detailed validation issues
      });
    }
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    const hashedPassword = encodeHexLowerCase(
      sha256(new TextEncoder().encode(password))
    );
    if (user.length < 1 || user[0].password !== hashedPassword) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      // Generate session token
      const token = generateSessionToken();
      const session = await createSession(token, user[0].id);
      if (!session) {
        res.status(500).json({ message: "Failed to create session" });
        return;
      }
      setSessionTokenCookie(res, token, session.expiresAt);
      res.status(200).json({ message: "Logged in successfully" });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const customMessages = error.errors.map((err) => err.message);

      res.status(400).json({
        message: "Validation failed",
        errors: customMessages, // Detailed validation issues
      });
    }
  }
};

export function generateSessionToken(): string {
  const bytes = crypto.randomBytes(20); // Generate 20 random bytes  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export const createSession = async (
  token: string,
  userId: string
): Promise<Session | null> => {
  try {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await db.insert(sessionTable).values(session);
    return session;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.session; // Retrieve session token from cookies
    if (!token) {
      res.status(400).json({ message: "No session token provided" });
      return;
    }
    const encodedToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const isInvalidated = await invalidateSession(encodedToken);
    if (isInvalidated) {
      deleteSessionTokenCookie(res); // Delete cookie
      res.json({ message: "Logout successful" });
    } else {
      res.status(400).json({ message: "Invalid session token" });
    }
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function invalidateSession(sessionId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, sessionId));
    if (result.rowCount == 0) {
      console.log("No session found with the provided ID.");
      return false;
    }
    console.log("deleted session");
    return true; // Return true if deletion was successful
  } catch (error) {
    console.error("Failed to invalidate session:", error);
    return false; // Return false if an error occurred
  }
}

const FAILURE_THRESHOLD = 5; // Number of failed requests allowed before triggering alert
const TIME_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds

// Function to track failed requests
export async function trackFailedRequest(ip: string, reason: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - TIME_WINDOW);

  // Calculate the number of failed attempts within the time window
  const failedCount = await db
    .select()
    .from(ipFailureTable)
    .where(
      and(
        eq(ipFailureTable.ip_address, ip),
        gte(ipFailureTable.createdAt, windowStart),
        lte(ipFailureTable.createdAt, now)
      )
    )
    .then((rows) => rows.length);

  // Trigger alert if the count exceeds the threshold
  if (failedCount + 1 >= FAILURE_THRESHOLD) {
    console.log(`ALERT: IP ${ip} has exceeded the threshold of failed requests.`);
    await sendEmailAlert(ip); // Implement this function to send an email alert
  }

  // Insert the new failed request into the database
  await db.insert(ipFailureTable).values({
    reason,
    ip_address: ip,
    createdAt: now,
    expiresAt: new Date(now.getTime() + TIME_WINDOW), // Optional expiration timestamp
  });
}



export async function validateSessionTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.session;


    // Validate the session token
    const validated = await validateSessionToken(token);
    if (!validated.session || !validated.user || !token) {
      res.status(401).json({
        status: "fail",
        message: "Token validation failed",
      });
      return;
    }
    // Attach session and user data to the req object
    req.session = validated.session;
    req.user = validated.user;
    next(); // Pass control to the next middleware/handler
  } catch (error) {
    console.error("Error validating session token:", error);
    // Return a generic error response
    res.status(500).json({
      status: "error",
      message: "Internal server error while validating session token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
