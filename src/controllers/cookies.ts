import { Response } from "express";
import { generateState } from "arctic";
import { github } from "../lib/github.js";

export function setSessionTokenCookie(response: Response, token: string, expiresAt:Date): void {
	if (process.env.NODE_ENV === 'production') {
		// When deployed over HTTPS
		response.setHeader(
			"Set-Cookie",
			`session=${token}; HttpOnly; SameSite=None; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`
		);
	} else {
		// When deployed over HTTP (localhost)
		response.setHeader(
			"Set-Cookie",
			`session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`
		);
	}
}
export async function githubTokenCookie(response: Response): Promise<void>{
	const state = generateState();
	const url = github.createAuthorizationURL(state, []);
	
	if (process.env.NODE_ENV === 'production') {
		// When deployed over HTTPS
		response.setHeader(
			"Set-Cookie",
			`github_oauth_state=${state}; HttpOnly; SameSite=None; Max-Age=600; Path=/; Secure;`
		);
	} else {
		// When deployed over HTTP (localhost)
		response.setHeader(
			"Set-Cookie",
			`github_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/`
		);
	}
	response.redirect(url.toString());
}

export function deleteSessionTokenCookie(response: Response): void {
	if (process.env.NODE_ENV === 'production') {
		// When deployed over HTTPS
		response.setHeader(
			"Set-Cookie",
			"session=; HttpOnly; SameSite=None; Max-Age=0; Path=/; Secure;"
		);
	} else {
		// When deployed over HTTP (localhost)
		response.setHeader("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
	}
}