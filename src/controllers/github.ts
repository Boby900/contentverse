import type { OAuth2Tokens } from "arctic";
import { generateState } from "arctic";
import { github } from "../lib/github.js";
import { Response, Request } from "express";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema.js";
import { setSessionTokenCookie } from "./cookies.js";
import { generateSessionToken, createSession } from "./auth.js";
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
    console.log(githubUser)
    const githubUserId = githubUser.id;
    const githubUsername = githubUser.login;
    const githubAvatar = githubUser.avatar_url;
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
          ? `https://clientverse.vercel.app/dashboard`
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
        ? `https://clientverse.vercel.app/dashboard`
        : `http://localhost:5173/dashboard?gh_user_id=${githubUserId}&username=${githubUsername}&github_avatar=${githubAvatar}`;
    res.redirect(redirectURL);
      
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