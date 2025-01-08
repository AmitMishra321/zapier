import "dotenv/config";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { sendEmail } from "./email";
import prisma from "@repo/db/client";

/* Signup User Function */

export async function signUpUser(
  email: string,
  name: string,
  password: string
) {
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = addMinutes(new Date(), 15); // Token valid for 15 minutes

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const verificationUrl = `${process.env.APP_URL}/signup/verify?id=${user.id}&token=${token}`;
  const verificationUrlText = `Verify your email by clicking here: ${verificationUrl}`
  const subject = `Signup Verification`
  await sendEmail(email, subject ,verificationUrlText);

  return { message: "Verification email sent." };
}

/* Verify Email Function */

export async function verifyEmail(token: string) {
  const verificationRecord = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired token.");
  }

  const res = await prisma.user.update({
    where: { id: verificationRecord.userId },
    data: { verified: true },
  });

  await prisma.verificationToken.delete({
    where: { id: verificationRecord.id },
  });

  return { verified: res.verified, message: "Email verified successfully." };
}

// Type for User 
export type UserTypes = {
  id: number;
  email: string;
  name: string;
  password: string;
  verified: boolean;
}
/* Resend Email Function */

export async function ResendEmail (user: UserTypes) {
  
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = addMinutes(new Date(), 15); // Token valid for 15 minutes

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const verificationUrl = `${process.env.APP_URL}/signup/verify?id=${user.id}&token=${token}`;
  const verificationUrlText = `Verify your email by clicking here: ${verificationUrl}`
  const subject = `Signup Verification`
  await sendEmail(user.email, subject ,verificationUrlText);

  return { message: "Verification email sent." };
}


/* Forget Password Function */

export async function ForgetPassword (user: UserTypes) {
  
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = addMinutes(new Date(), 15); // Token valid for 15 minutes

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const verificationUrl = `${process.env.APP_URL}/forget/reset/?id=${user.id}&token=${token}`;
  const verificationUrlText = `Reset password by clicking here: ${verificationUrl}`
  const subject = `Forget Password`
  await sendEmail(user.email, subject ,verificationUrlText);

  return { message: "Verification email sent." };
}


/* Verify Forget Password Function */

export async function VerifyForgetPassword(token: string,password:string) {
  const verificationRecord = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired token.");
  }
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  
  const res = await prisma.user.update({
    where: { id: verificationRecord.userId },
    data: { password:hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { id: verificationRecord.id },
  });

  return { message: "Password Updated successfully." };
}


/* Login User Function */

export async function loginUser(email: string, password: string) {
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error("User does not exist.");
      (error as any).statusCode = 404;
      throw error;
    }

    if (user.password !== hashedPassword) {
      const error = new Error("Invalid email or password.");
      (error as any).statusCode = 401;
      throw error;
    }

    if (!user.verified) {
      const error = new Error("Email not verified. Please verify your email before logging in.");
      (error as any).statusCode = 403;
      throw error;
    }

    return {
      message: "Login successful.",
      user,
    };
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
}

