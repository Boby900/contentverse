import type { Session, User } from "../db/schema.js";
import { sessionTable, userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { Response, Request, NextFunction } from "express";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export const signupHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (existingUser.length >= 1) {
    res.status(404).send({ message: "User already exists" });
  } else {
    // // Hash password (implement hashing logic with oslojs or other)
    const hashedPassword = encodeHexLowerCase(
      sha256(new TextEncoder().encode(password))
    );

    // // Insert user into database
    const newUser = await db
      .insert(userTable)
      .values({ email, password: hashedPassword });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

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
  }
  else{
 // Generate session token
 const token = generateSessionToken();
 await createSession(token, user[0].id);

 res.status(200).json({ message: "Logged in successfully", token });
  }
 
};



export const logoutHandler = async (req: Request, res: Response) => {
  // Logic for user logout
  res.status(201).send("hi loging out");
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
    console.log(session);

    return session;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
// 	// TODO
// }

export async function invalidateSession(sessionId: string): Promise<void> {
  // TODO
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
