import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

let x = LAMPORTS_PER_SOL;

const wallet = new Keypair();
const publicKey = new PublicKey(wallet.publicKey);
const secretKey = wallet.secretKey;

const getWalletBalance = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletBalance = await connection.getBalance(publicKey);
    console.log("Wallet balance: " + walletBalance);
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  await getWalletBalance();
})();
