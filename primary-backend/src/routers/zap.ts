import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const body = req.body;
  const parseData = ZapCreateSchema.safeParse(body);
  if (!parseData.success) {
    res.status(411).json({
      message: "Incorrect Inputs",
    });
    return;
  }

 const zapId= await prismaClient.zap.create({
    data: {
      userId: id,
      triggerId: parseData.data?.availableTriggerId,
      trigger: {
        create: {
          triggerId: parseData.data?.availableTriggerId,
        },
      },
      actions: {
        create: parseData.data?.actions.map((x, index) => ({
          actionId: x.availableActionId,
          sortingOrder: index,
        })),
      },
    },
 });
  
  res.json({zapId:zapId.id})
});

router.get("/", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;

  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
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
  res.json({ zaps });
  
});
router.get("/:zapId", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
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
  res.json({ zaps });

});

export const zapRouter = router;
