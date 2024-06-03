import {
  BlockheightBasedTransactionConfirmationStrategy,
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

const airDropSol = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const fromAirDropSignature = await connection.requestAirdrop(
      publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();

    console.log("fromAirDropSignature: ", fromAirDropSignature);

    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    };

    // https://stackoverflow.com/a/72333685/2132069
    await connection.confirmTransaction(strategy);
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
})();
