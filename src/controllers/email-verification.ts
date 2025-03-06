import { db } from "../db/index.js";
import { sendEmail } from "../utils/email-service.js";
import { generateRandomOTP } from "../utils/otpUtils.js";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { emailVerificationTable, userTable } from "../db/schema.js";
import sendWelcomeEmail from "../utils/welcome-email.js";

// Send Verification Email
export async function sendVerificationEmail(req: Request, res: Response, userId: string) {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const verificationCode = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

  // Upsert OTP
  await db
    .insert(emailVerificationTable)
    .values({ userId: userId, otp: verificationCode, expiresAt })
    .onConflictDoUpdate({
      target: [emailVerificationTable.userId],
      set: { otp: verificationCode, expiresAt },
    });

  await sendEmail(
    email,
    "Email Verification",
    `Your verification code: ${verificationCode}`
  );

  res.status(200).json({ message: "Verification email sent." });
}

// Verify Email Code
export async function verifyEmailCode(req: Request, res: Response) {
  const { email, code } = req.body;

  if (!email || !code) {
    res
      .status(400)
      .json({ message: "Email and verification code are required." });
    return;
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const verificationEntry = await db.query.emailVerificationTable.findFirst({
    where: eq(emailVerificationTable.userId, user.id),
  });

  if (!verificationEntry) {
    res.status(400).json({ message: "No verification request found." });
    return;
  }

  if (new Date() > verificationEntry.expiresAt) {
    res.status(400).json({ message: "Verification code expired." });
    return;
  }

  if (verificationEntry.otp !== code) {
    res.status(400).json({ message: "Invalid verification code." });
    return;
  }

  // Update user email verification status
  await db
    .update(userTable)
    .set({ email_verified: new Date() })
    .where(eq(userTable.id, user.id));

  // Delete OTP after successful verification
  await db
    .delete(emailVerificationTable)
    .where(eq(emailVerificationTable.userId, user.id));
    try {
      await sendWelcomeEmail(email); 
      res.status(200).json({ message: "Email verified successfully. Welcome email sent." });
  } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(200).json({ message: "Email verified successfully, but welcome email failed." }); // still send a 200, so the client knows it was verified.
  }
}
