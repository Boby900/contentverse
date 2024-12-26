import type { Session, User } from "../db/schema.js";
import { sessionTable, userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { Response, Request, NextFunction } from "express";
import type { OAuth2Tokens } from "arctic";

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { generateState } from "arctic";

import { sha256 } from "@oslojs/crypto/sha2";
import crypto from "crypto";
import { z, ZodError } from "zod";
import { github } from "../lib/github.js";
import { sendEmail } from "../lib/mailService.js";
import { setSessionTokenCookie, deleteSessionTokenCookie } from "./cookies.js";
const signupSchema = z.object({
  email: z.string().email().min(5),
  password: z.string().min(5),
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

      const token = generateSessionToken();
      const session = await createSession(token, newUser[0].id);
      if (!session) {
        res.status(500).json({ message: "Failed to create session" });
        return;
      }
      setSessionTokenCookie(res, token, session.expiresAt);
      res.status(201).json({ message: "User registered successfully" });
      await sendEmail(email);

      return;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors, // Detailed validation issues
      });
    }
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    // Find user by email
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
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors, // Detailed validation issues
      });
    }
  }
};

export const githubHandler = async (req: Request, res: Response) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, []);

  if (process.env.NODE_ENV === "production") {
    // When deployed over HTTPS
    res.setHeader(
      "Set-Cookie",
      `github_oauth_state=${state}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`
    );
  } else {
    // When deployed over HTTP (localhost)
    res.setHeader(
      "Set-Cookie",
      `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`
    );
  }
  res.redirect(url.toString());
};

export const githubCallBack = async (
  req: Request,
  res: Response
): Promise<void> => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.cookies.github_oauth_state;

  if (typeof code !== 'string' || typeof state !== 'string') {
    res.status(400).json({
      message: "Invalid or missing query parameters.",
    });
    return;
  } else if (state !== storedState) {
    res.status(400).json({ message: "Invalid state parameter." });
    return;
  }

  let tokens: OAuth2Tokens | null = null;

  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch (e) {
    // Invalid code or client credentials
    res.status(400).send("Invalid authorization code.");
    return;
  }
  if (!tokens) {
    res.status(400).send("Failed to retrieve tokens.");
    return;
  }
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  const githubUser = await githubUserResponse.json();
  const githubUserId = githubUser.id;
  const githubUsername = githubUser.login;
  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.githubId, githubUserId));

    if (existingUser.length >= 1) {
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser[0].id);
      if (!session) {
        res.status(500).json("some error while creating the session for the GH.");
        return;
      }
      await setSessionTokenCookie(res, sessionToken, session.expiresAt);
      const redirectURL =
      process.env.NODE_ENV === "production"
        ? "https://clientverse.vercel.app/"
        : "http://localhost:5173/dashboard";
    res.redirect(redirectURL);

      console.log(existingUser)
      return; // Stop further execution
    }    
    const user = await db
    .insert(userTable)
    .values({ githubId: githubUserId, username: githubUsername })
    .returning({id: userTable.id})
    console.log(user);
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user[0].id);
    if (!session) {
      res.status(500).json("some error while creating the session for the new GH user.");
      return;
    }
    await setSessionTokenCookie(res, sessionToken, session.expiresAt);
    const redirectURL =
    process.env.NODE_ENV === "production"
      ? "https://clientverse.vercel.app/dashboard"
      : "http://localhost:5173/dashboard";
  res.redirect(redirectURL);
    
};

function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

const createSession = async (
  token: string,
  userId: number
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
    console.log(token)
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
