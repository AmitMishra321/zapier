import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware";
import { SignInSchea, SignUpSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignUpSchema.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({ message: "Incorrect Input" });
    return;
  }

  const { email, name, password } = parsedData.data;
  const userExists = await prismaClient.user.findFirst({
    where: { email },
  });

  if (userExists) {
    res.status(403).send({ message: "User already exists" });
    return;
  }

  await prismaClient.user.create({
    data: {
      email,
      name,
      password,
    },
  });

  //await sendEmail()

  res.status(201).json({ message: "Please verify your account" });
});

router.post("/signin", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignInSchea.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({ message: "Incorrect Input" });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    res.status(403).json({ message: "Unauthorize" });
  }

  //Sign the jwt

  const token = jwt.sign(
    {
      id: user?.id,
    },
    JWT_PASSWORD
  );

  res.json({
    token,
  });
});
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  //TODO: Fix the type

  //@ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  });
  res.json({
    user,
  });
});

export const userRouter = router;


