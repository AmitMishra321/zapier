// import prisma from "@repo/db/client";
import { Kafka } from "kafkajs";
import prisma from "../../../packages/db/src";

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function Main() {
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    const pendingRows = await prisma.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });
    console.log(pendingRows);
    producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
      })),
    });

    await prisma.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((x) => x.id),
        },
      },
    });
    await new Promise((r) => setTimeout(r, 10000));
  }
}

Main();
