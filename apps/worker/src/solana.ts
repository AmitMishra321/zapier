import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  Connection,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", "finalized");

export async function sendSol(to: string, amount: string) {
  const { default: base58 } = await import("bs58");
  const keypair = Keypair.fromSecretKey(
    base58.decode(process.env.SOL_PRIVATE_KEY ?? ""),
  );
  console.log(keypair.publicKey);
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
    }),
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
  console.log("sol Sent!");
}
