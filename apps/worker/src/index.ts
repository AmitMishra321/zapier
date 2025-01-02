import 'dotenv/config';
import { JsonObject } from "@prisma/client/runtime/library";
import prisma from "@repo/db/client";
import { Kafka } from "kafkajs";
import { parse } from "./parse";
import { sendEmail } from "./email";
import { sendSol } from './solana';

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function Main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }
      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      const zapRunDetails = await prisma.zapRun.findFirst({
        where: {
          id: zapRunId,
        },
        include: {
          zap: {
            include: {
              actions: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });

      const currentAction = zapRunDetails?.zap.actions.find(
        (x) => x.sortingOrder === stage
      );

      if (!currentAction) {
        console.log("current action not found");
        return;
      }
      
      const zapRunMetadata = zapRunDetails?.metadata
      if (currentAction.type.id === "email") {
        const body = parse((currentAction.metadata as JsonObject)?.body as string , zapRunMetadata)
        const email = parse((currentAction.metadata as JsonObject)?.email as string , zapRunMetadata)
        console.log(`Sending out an email to ${email} body is ${body}`);
        await sendEmail(email,body)
      }
      if (currentAction.type.id === "sol") {
        const amount = parse((currentAction.metadata as JsonObject)?.amount as string , zapRunMetadata)
        const address = parse((currentAction.metadata as JsonObject)?.address as string , zapRunMetadata)
        console.log(`Sending out Sol of ${amount} to address ${address}`);
        await sendSol(address, amount);
      }

      await new Promise((r) => setTimeout(r, 500));

      const lastStage = (zapRunDetails?.zap.actions.length || 1) - 1;
      if(lastStage !== stage){
        await producer.send({
          topic: TOPIC_NAME,
          messages: [{
            value: JSON.stringify({
              stage: stage + 1,
              zapRunId,
            })
          }]
        })
      }

      console.log("processing done");

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    },
  });
}

Main();
