import { Google } from "arctic";
const redirectUrl =
  process.env.NODE_ENV === "production"
    ? "https://contentverse-ohph.onrender.com/api/auth/google/login/callback"
    : "http://localhost:3000/api/auth/google/login/callback";
export const google = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_CLIENT_SECRET!,
	redirectUrl
);