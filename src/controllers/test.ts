// export const githubCallBack = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const baseUrl = "http://localhost:3000"; // Ensure this matches your server's base URL
//   const url = new URL("/github/login/callback", baseUrl); // Correctly forms an absolute URL

//   const code = url.searchParams.get("code");
//   const state = url.searchParams.get("state");
//   const test = req.cookies["github_oauth_state"];
//   console.log(test);
//   // const cookieStore = await cookies();
//   // const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
//   // if (code === null || state === null || storedState === null) {
//   //   return new Response(null, {
//   //     status: 400,
//   //   });
//   // }
//   // if (state !== storedState) {
//   //   return res.status(400).send("Invalid state parameter.");
//   // }

//   let tokens: OAuth2Tokens | null = null;
//   try {
//     tokens = await github.validateAuthorizationCode(code!);
//   } catch (e) {
//     // Invalid code or client credentials
//     res.status(400).send("Invalid authorization code.");
//   }
//   if (!tokens) {
//     res.status(400).send("Failed to retrieve tokens.");
//     return;
//   }
//   const githubUserResponse = await fetch("https://api.github.com/user", {
//     headers: {
//       Authorization: `Bearer ${tokens.accessToken()}`,
//     },
//   });
//   const githubUser = await githubUserResponse.json();
//   const githubUserId = githubUser.id;
//   const githubUsername = githubUser.login;

//   // TODO: Replace this with your own DB query.
//   const existingUser = await db
//     .select()
//     .from(userTable)
//     .where(eq(userTable.githubId, githubUserId));

//   if (existingUser !== null) {
//     const sessionToken = generateSessionToken();
//     const session = await createSession(sessionToken, existingUser[0].id);
//     if (!session) {
//       res.send("some error while creating the session for the GH.");
//       return;
//     }
//     await setSessionTokenCookie(res, sessionToken, session.expiresAt);
//     res.status(400).send("Invalid authorization code.");
//   }

//   // TODO: Replace this with your own DB query.

//   const user = await db
//     .insert(userTable)
//     .values({ githubId: githubUserId, username: githubUsername });
//   console.log(user);
//   // const sessionToken = generateSessionToken();
//   // const session = await createSession(sessionToken, user.id);
//   // if (!session) {
//   //   return "session not found when creating the GH session";
//   // }
//   // await setSessionTokenCookie(res, sessionToken, session.expiresAt);
//   res.status(400).send("Invalid authorization code.");
// };
