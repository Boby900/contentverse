import { Google } from "arctic";
const redirectUrl =
  process.env.NODE_ENV === "production"
    ? "https://contentverse-production.up.railway.app/api/auth/github/login/callback"
    : "http://localhost:3000/api/auth/login/google/callback";
export const google = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_CLIENT_SECRET!,
	redirectUrl
);