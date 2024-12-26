import type { OAuth2Tokens } from "arctic";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../lib/google.js";
import { Response, Request } from "express";
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
      // When deployed over HTTPS
      res.setHeader(
        "Set-Cookie",
        `google_oauth_state=${state}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`
      );
      res.setHeader(
        "Set-Cookie",
        `google_code_verifier=${codeVerifier}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`
      );
      
    } else {
      // When deployed over HTTP (localhost)
      res.setHeader(
        "Set-Cookie",
        `google_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`
      );
      res.setHeader(
        "Set-Cookie",
        `google_code_verifier=${codeVerifier}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`
      );
    }
    res.redirect(url.toString());
  };


  export const googleCallBack = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const code = req.query.code;
    const state = req.query.state;
    const codeVerifier = req.query.google_code_verifier;
    const storedState = req.cookies.google_oauth_state;
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
    const claims = decodeIdToken(tokens.idToken());







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
          ? `https://clientverse.vercel.app/dashboard?gh_user_id=${githubUserId}&username=${githubUsername}&github_avatar=${githubAvatar}`
          : `http://localhost:5173/dashboard?gh_user_id=${githubUserId}&username=${githubUsername}&github_avatar=${githubAvatar}`;
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
        ? `https://clientverse.vercel.app/dashboard?gh_user_id=${githubUserId}&username=${githubUsername}&github_avatar=${githubAvatar}`
        : `http://localhost:5173/dashboard?gh_user_id=${githubUserId}&username=${githubUsername}&github_avatar=${githubAvatar}`;
    res.redirect(redirectURL);
      
  };