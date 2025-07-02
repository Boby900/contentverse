import { GitHub } from "arctic";
const redirectUrl =
  process.env.NODE_ENV === "production"
    ? "https://contentverse-ohph.onrender.com/api/auth/github/login/callback"
    : "http://localhost:3000/api/auth/github/login/callback";
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  redirectUrl // Replace with the appropriate URI for your environment
);
