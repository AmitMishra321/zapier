
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
    await prismaClient.availableTrigger.create({
        data: {
            id: "webhook",
            name: "Webhook",
            image: "https://img.icons8.com/?size=512&id=24459&format=png",
            
        }
    })    

    await prismaClient.availableAction.create({
        data: {
            id: "sol",
            name: "Solana",
            image: "https://logosandtypes.com/wp-content/uploads/2022/04/Solana.png"
        }
    })

    await prismaClient.availableAction.create({
        data: {
            id: "email",
            name: "Email",
            image: "https://media.istockphoto.com/id/826567080/vector/e-mail-icon-simple-vector-illustration-red-color.jpg?s=612x612&w=0&k=20&c=ysxmzarWz_6a2oyi1ue9p6OUBXAw8W1LQPsyorc_5hY="
        }
    })
    
}

main();