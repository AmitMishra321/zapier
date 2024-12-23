import express from "express";
const app = express();
const PORT = 3003;
import prisma from "@repo/db/client";

app.use(express.json());

// https://hooks.zapier.com/hooks/catch/17043103/22b8496/
app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  // password logic using userId
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // store in db a new trigger
  await prisma.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });
    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
    res.json({
        message: "Webhook received"
    })
  });
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
