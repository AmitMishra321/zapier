import express, { Request, Response, Router } from "express";
const router: Router = express.Router();
import { SigninSchema, SignupSchema } from "../types";
import prisma from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../middleware";


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

    const userExists = await prisma.user.findFirst({
      where: {
        email: parsedData.data.username,
      },
    });

    if (userExists) {
      res.status(403).json({
        message: "User already exists",
      });
      return;
    }

    await prisma.user.create({
      data: {
        email: parsedData.data.username,
        password: parsedData.data.password, // TODO: hash password
        name: parsedData.data.name,
      },
    });

    // await sendEmail()

    res.json({
      message: "Please verify your account by checking your email",
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

/* ------------ SignIn -------------- */

router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
      console.log(parsedData.error);
      res.status(401).json({
        messages: "Wrong Input",
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: parsedData.data.username,
        password: parsedData.data.password,
      },
    });

    if (!user) {
      res.status(403).json({
        message: "Sorry credentials are incorrect",
      });
      return;
    }

    const token = jwt.sign({
        id: user.id
    }, JWT_PASSWORD)

    res.json({
        token
    })
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
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
          id: Number(id), 
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
  
      res.json({
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
