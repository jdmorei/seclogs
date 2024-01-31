const Blockfrost = require("@blockfrost/blockfrost-js");
const dotenv = require("dotenv");
dotenv.config();

const Logs = require("../model/log");
const checkCardano = async () => {
  console.log("checking CARDANO");
  const API = new Blockfrost.BlockFrostAPI({
    projectId: process.env.BLOCKFROST_PROJECT_ID, // see: https://blockfrost.io
    network: process.env.BLOCKFROST_NETWORK,
  });

  const logs = await Logs.find({
    statusTrx: "pending",
  }).limit(50);

  for (const log of logs) {
    try {
      const pendingTrx = await API.txs(log.trx);

      if (pendingTrx) {
        log.statusTrx = "confirmed";
        log.confirmedTime = new Date(pendingTrx.block_time * 1000);

        log.save();
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = { checkCardano };
