import express, { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import prisma from "../../../../packages/db/src";
// import prisma from "@repo/db/client";
const router: Router = express.Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.id;
    const body = req.body;
    const parsedData = ZapCreateSchema.safeParse(body);

    if (!id || isNaN(Number(id))) {
      res.status(403).json({
        message: "Unauthorized or invalid user ID",
      });
      return;
    }
    if (!parsedData.success) {
      res.status(401).json({
        message: "Wrong input",
      });
      return;
    }

    const zapId = await prisma.$transaction(async (tx) => {
      const zap = await tx.zap.create({
        data: {
          userId: parseInt(id),
          triggerId: "",
          actions: {
            create: parsedData.data.actions.map((action, index) => ({
              actionId: action.availableActionId,
              sortingOrder: index,
              metadata: action.actionMetadata,
            })),
          },
        },
      });

      const trigger = await tx.trigger.create({
        data: {
          triggerId: parsedData.data.availableTriggerId,
          zapId: zap.id,
        },
      });

      await tx.zap.update({
        where: {
          id: zap.id,
        },
        data: {
          triggerId: trigger.id,
        },
      });

      return zap.id;
    });

    res.status(201).json({
      status: "success",
      zapId,
      message: "Zap created successfully",
    });
  } catch (error: any) {
    console.log("Zap Creation Error:", error);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while creating the Zap",
    });
  }
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.id;
    if (!id || isNaN(Number(id))) {
      res.status(403).json({
        message: "Unauthorized or invalid user ID",
      });
      return;
    }
    const zaps = await prisma.zap.findMany({
      where: {
        userId: parseInt(id),
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    res.status(200).json({
      zaps,
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

router.get("/:zapId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.id;
    const zapId = req.params?.zapId;

    if (!id || isNaN(Number(id))) {
      res.status(403).json({
        message: "Unauthorized or invalid user ID",
      });
      return;
    }
    if (!zapId) {
      res.status(403).json({
        message: "Invalid zap ID",
      });
      return;
    }

    const zap = await prisma.zap.findFirst({
      where: {
        userId: parseInt(id),
        id: zapId,
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    res.status(200).json({
      zap,
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

export default router;
