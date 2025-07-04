import type { OAuth2Tokens } from "arctic";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../lib/google.js";
import { Response, Request, NextFunction } from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema.js";
import { setSessionTokenCookie } from "./cookies.js";
import { generateSessionToken, createSession } from "./auth.js";
import { decodeIdToken } from "arctic";
type GoogleIdTokenClaims = {
  sub: string; // The unique user ID from Google
  name?: string; // Optional if not always present
  email?: string; // Include other properties as needed
};

  export const googleHandler = async (req: Request, res: Response) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile"]);


    if (process.env.NODE_ENV === "production") {
      res.setHeader("Set-Cookie", [
        `google_oauth_state=${state}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`,
        `google_code_verifier=${codeVerifier}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`,
      ]);
    } else {
      res.setHeader("Set-Cookie", [
        `google_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`,
        `google_code_verifier=${codeVerifier}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`,
      ]);
    }
    


    res.redirect(url.toString());
  };


  export const googleCallBack = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    const code = req.query.code;
    const state = req.query.state;
    const storedState = req.cookies.google_oauth_state;
    const codeVerifier = req.cookies.google_code_verifier;
  
    if (typeof code !== 'string' || typeof state !== 'string' || typeof codeVerifier !== 'string') {
      res.status(400).json({
        message: "Invalid or missing query parameters.",
      });
      return;
    } else if (state !== storedState) {
      res.status(400).json({ message: "Invalid state parameter." });
      return;
    }
    let tokens: OAuth2Tokens;
    try {
      tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
      // Invalid code or client credentials
      res.status(400).send("Invalid authorization code.");
      return;
    }
    if (!tokens) {
      res.status(400).send("Failed to retrieve tokens.");
      return;
    }
    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.accessToken()}` },
      }
    );

    const googleUser = await googleUserResponse.json();
    const googleAvatar = googleUser.picture;
    const claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;

	const googleUserId = claims.sub;
	const username = claims.name;
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.googleId, googleUserId));
  
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
          ? `https://clientverse.vercel.app/dashboard?google_user_id=${googleUserId}&username=${username}&google_avatar=${googleAvatar}`
          : `http://localhost:5173/dashboard?google_user_id=${googleUserId}&username=${username}&google_avatar=${googleAvatar}`;
        res.redirect(redirectURL);
  
        return; // Stop further execution
      }    
      const user = await db
      .insert(userTable)
      .values({  googleId: googleUserId, username: username })
      .returning({id: userTable.id})
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user[0].id);
      if (!session) {
        res.status(500).json("some error while creating the session for the new Google user.");
        return;
      }
      await setSessionTokenCookie(res, sessionToken, session.expiresAt);
      const redirectURL =
        process.env.NODE_ENV === "production"
          ? `https://clientverse.vercel.app/dashboard?google_user_id=${googleUserId}&username=${username}&google_avatar=${googleAvatar}`
          : `http://localhost:5173/dashboard?google_user_id=${googleUserId}&username=${username}&google_avatar=${googleAvatar}`;
    res.redirect(redirectURL);
      
  };