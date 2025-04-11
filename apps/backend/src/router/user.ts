import "dotenv/config";
import express, { Request, Response, Router } from "express";
const router: Router = express.Router();
import {
  EmailSchema,
  ForgetPasswordSchema,
  SigninSchema,
  SignupSchema,
} from "../types";
// import prisma from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../middleware";
import {
  loginUser,
  ResendEmail,
  signUpUser,
  verifyEmail,
  UserTypes,
  ForgetPassword,
  VerifyForgetPassword,
} from "../utils/auth";
import prisma from "../../../../packages/db/src";

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);
    if (!parsedData.success) {
      console.log(parsedData.error);
      res.status(401).json({
        messages: "Wrong Input",
      });
      return;
    }

    const { name, password, username: email } = parsedData.data;

    const userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      res.status(403).json({
        message: "User already exists",
      });
      return;
    }
    const response = await signUpUser(email, name, password);

    res.status(201).json({
      message: response.message,
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

/* ------------ Verify Email -------------- */

router.get("/verify-email", async (req, res) => {
  const { token, id } = req.query;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user?.id) {
      const error = new Error("User does not exist.");
      (error as any).statusCode = 404;
      throw error;
    }
    const response = await verifyEmail(token as string);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/* ------------ Resend Email Verification -------------- */

router.get("/resend-email-verification", async (req, res) => {
  const { id } = req.query;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    const response = await ResendEmail(user as UserTypes);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/* ------------ Forget Password -------------- */

router.post("/forget", async (req, res) => {
  try {
    const body = req.body;
    const parsedData = EmailSchema.safeParse(body);

    if (!parsedData.success) {
      console.log("Validation Error:", parsedData.error);
      res.status(400).json({
        message: "Invalid input data.",
      });
      return;
    }

    const { username: email } = parsedData.data;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    const response = await ForgetPassword(user as UserTypes);
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
/* ------------ Reset Forget Password -------------- */

router.post("/reset-password", async (req, res) => {
  try {
    const body = req.body;
    const parsedData = ForgetPasswordSchema.safeParse(body);

    if (!parsedData.success) {
      console.log("Validation Error:", parsedData.error);
      res.status(400).json({
        message: "Invalid input data.",
      });
      return;
    }

    const { token, id, password } = parsedData.data;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id as string),
      },
    });

    if (!user?.id) {
      const error = new Error("User does not exist.");
      (error as any).statusCode = 404;
      throw error;
    }
    const response = await VerifyForgetPassword(
      token as string,
      password as string,
    );
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/* ------------ SignIn -------------- */

router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
      console.log("Validation Error:", parsedData.error);
      res.status(400).json({
        message: "Invalid input data.",
      });
      return;
    }

    const { password, username: email } = parsedData.data;

    const response = await loginUser(email, password);

    const token = jwt.sign({ id: response.user.id }, JWT_PASSWORD);

    res.status(200).json({
      msg: response.message,
      token,
    });
  } catch (error: any) {
    console.error("Error in /signin:", error);

    if (error.statusCode) {
      // If the error has a statusCode, send it
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    // Fallback for unexpected errors
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
    return;
  }
});

/* ------------ / (Getting User) -------------- */

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.id;

    if (!id || isNaN(Number(id))) {
      res.status(403).json({
        message: "Unauthorized or invalid user ID",
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

export default router;
