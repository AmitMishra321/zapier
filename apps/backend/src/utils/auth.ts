import "dotenv/config";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { sendEmail } from "./email";
import prisma from "@repo/db/client";

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

  const verificationUrl = `${process.env.APP_URL}/signup/verify?token=${token}`;
  await sendEmail(email, verificationUrl);

  return { message: "Verification email sent." };
}

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

