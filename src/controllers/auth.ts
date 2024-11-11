import type {Session, User} from "../db/schema.js"
import { sessionTable, userTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { Response, Request, NextFunction } from "express";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";


export const signupHandler = async (req: Request, res: Response) => {
	
		const { email, password } = req.body;
	
		// Check if user already exists
		const existingUser = await db.select().from(userTable).where(eq(userTable.email, email));
		console.log(existingUser)
		// if (existingUser) {
		// 	return res.status(409).json({ message: "User already exists" });
		//   }
	
		// // Hash password (implement hashing logic with oslojs or other)
		const hashedPassword = encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
	
		// // Insert user into database
		const newUser = await db.insert(userTable).values({ email, password: hashedPassword })
	
		res.status(201).json({ message: "User registered successfully", user: newUser});
	
	  
};

export const loginHandler = async (req: Request, res: Response) => {
  // Logic for user login and session creation
  res.status(201).send("hi login up")

};

export const logoutHandler = async (req: Request, res: Response) => {
  // Logic for user logout
  res.status(201).send("hi loging out")

};









export const generateSessionToken = (req: Request, res: Response, next: NextFunction) =>{
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
    console.log(token)
    res.status(201).send({token})
    
}

const createSession = async(token: string, userId: number): Promise<Session | null>=>{
	
	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	// await db.insert(sessionTable).values(session);
	console.log(session)

	return session;
	} catch (error) {
		console.error(error)
		return null
	}

	

}

export const createSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.body.token;
        const userId = req.body.userId;
        const session = await createSession(token, userId);
        res.status(201).json(session);
    } catch (error) {
        next(error);  // Handle errors through Express middleware
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