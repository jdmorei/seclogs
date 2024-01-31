const { Connection, clusterApiUrl } = require("@solana/web3.js");
const dotenv = require("dotenv");

const Logs = require("../model/log");

const checkSolana = async () => {
  console.log("checking");

  const connection = new Connection(clusterApiUrl("devnet"));

  const logs = await Logs.find({
    statusTrx: "pending",
  }).limit(50);

  const trxList = logs.map((x) => x.trx);

  const pendingTRXs = await connection.getParsedTransactions(trxList);

  for (const trxDetail of pendingTRXs) {
    if (trxDetail.blockTime) {
      const confirmedLog = logs.find((x) =>
        trxDetail.transaction.signatures.includes(x.trx)
      );

      if (confirmedLog) {
        confirmedLog.statusTrx = "confirmed";
        confirmedLog.confirmedTime = new Date(trxDetail.blockTime * 1000);

        confirmedLog.save();
      }
    }
  }
};

module.exports = { checkSolana };
