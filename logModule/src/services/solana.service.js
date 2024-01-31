const {
  Keypair,
  Connection,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} = require("@solana/web3.js");
const { performance } = require("perf_hooks");
const dotenv = require("dotenv");

dotenv.config();

class SolanaService {
  constructor() {
    this.keypair = null;
    this.connection = null;
    this.publicKey = null;
    this.secretKey = null;
    this.from = null;
  }

  async getSecretKey() {
    return this.keypair.secretKey;
  }

  async initSolana() {
    this.secretKey = Uint8Array.from(
      [
        44, 123, 48, 119, 93, 225, 74, 248, 77, 253, 243, 229, 94, 198, 92, 45,
        114, 57, 100, 23, 154, 71, 50, 99, 199, 46, 127, 216, 75, 167, 219, 140,
        170, 158, 84, 125, 167, 174, 158, 25, 213, 111, 147, 38, 175, 3, 142,
        19, 234, 195, 241, 108, 50, 143, 51, 199, 9, 171, 243, 82, 69, 253, 25,
        140,
      ].slice(0, 32)
    );
    this.keypair = Keypair.fromSeed(this.secretKey);
    this.from = Keypair.fromSecretKey(
      Uint8Array.from([
        24, 172, 132, 233, 207, 37, 194, 122, 125, 217, 248, 211, 30, 114, 212,
        219, 87, 40, 67, 30, 156, 154, 32, 211, 70, 92, 100, 99, 230, 240, 136,
        117, 237, 200, 43, 239, 17, 83, 209, 193, 33, 143, 135, 245, 205, 249,
        198, 91, 101, 4, 165, 9, 63, 176, 250, 88, 183, 251, 153, 179, 233, 215,
        55, 114,
      ])
    );
    this.publicKey = this.keypair.publicKey.toBase58();
    this.connection = new Connection(clusterApiUrl("devnet"));
    this.getBalance();
  }

  async writeLog() {
    try {
      const currentBalance = await this.getBalance();

      if (currentBalance < 1000) {
        const askFaucet = performance.now();
        await this.askForMoreSol();
        const returnFaucet = performance.now();
        console.log(`Solana faucet ${returnFaucet - askFaucet} ms`);
      }

      let transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.publicKey),
          toPubkey: new PublicKey(process.env.PUBLICMASTERKEY),
          lamports: 0.000000001,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair]
      );

      return { id: signature };
    } catch (e) {
      await this.delay(1000);
      console.log(e);
    }
  }

  async getBalance() {
    try {
      let balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance;
    } catch (e) {
      await this.delay(500);
      let balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance;
    }
  }

  async createWallet() {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey.toBase58();
    const address = keypair.publicKey.toAddress();
    const balance = await this.connection.getBalance(keypair.publicKey);
    const result = {
      publicKey: publicKey,
      secretKey: secretKey,
      address: address,
      balance: balance,
    };
    return result;
  }

  async messageAccountSize(text) {
    const textBuffer = Buffer.from(text);
    return 32 + 32 + 32 + textBuffer.length; // 32 = size of a public key
  }

  async askForMoreSol() {
    const airdropSignature = await this.connection.requestAirdrop(
      new PublicKey(this.publicKey),
      LAMPORTS_PER_SOL
    );

    await this.connection.confirmTransaction(airdropSignature);
  }

  async delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

export default new SolanaService();
