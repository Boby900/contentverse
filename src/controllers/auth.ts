import type {Session, User} from "../db/schema.js"
import { sessionTable, userTable } from "../db/schema.js";
import { db } from "../db/index.js";
import { Response, Request, NextFunction } from "express";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export const generateSessionToken = (req: Request, res: Response, next: NextFunction) =>{
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
    console.log(token)
    res.status(201).send({token})
    
}

const createSession = async(token: string, userId: number): Promise<Session>=>{
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	// await db.insert(sessionTable).values(session);
	console.log(session)

	return session;

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
// export async function createSession(token: string, userId: number): Promise<Session> {
// 	// TODO
// }

// export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
// 	// TODO
// }

export async function invalidateSession(sessionId: string): Promise<void> {
	// TODO
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };