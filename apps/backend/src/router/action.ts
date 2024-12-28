import prisma from "@repo/db/client";
import express, { Router } from "express";
import { authMiddleware } from "../middleware";
const router: Router = express.Router();


router.get("/available", authMiddleware, async (req, res) => {
  try {
    const availableActions = await prisma.availableAction.findMany({})
     
    res.status(200).json({
      availableActions
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

export default router;