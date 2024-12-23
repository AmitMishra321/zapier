import prisma from "@repo/db/client";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function Main() {
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    const pendingRow = await prisma.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    producer.send({
      topic: TOPIC_NAME,
      messages: pendingRow.map((r) => ({
        value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
      })),
    });

    await prisma.zapRunOutbox.deleteMany({
        where:{
            id:{
                in: pendingRow.map(x => x.id)
            }
        }
    })
  }
}

Main();
