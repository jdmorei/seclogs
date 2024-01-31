const { Agenda } = require("@hokify/agenda");
const { checkSolana } = require("./checkSolana");
const { checkCardano } = require("./checkCardano");

const possibleBlockchains = ["solana", "cardano"];

const initJobScheduler = async (mongoConnectionString) => {
  const agenda = new Agenda({ db: { address: mongoConnectionString } });
  agenda.define("checkBlockchains", async (job) => {
    const blockchainSelected = (process.env.BLOCKCHAIN ?? "").toLowerCase();

    if (!possibleBlockchains.includes(blockchainSelected))
      throw new Error("You did not selected a valid blockchain");

    if (blockchainSelected === "solana") {
      await checkSolana();
    } else {
      await checkCardano();
    }
  });

  (async function () {
    await agenda.start();

    await agenda.every("3 minutes", "checkBlockchains");
  })();
};

module.exports = { initJobScheduler };
