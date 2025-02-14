"use strict";

import express, { json } from "express";
import router from "./routes";

import SolanaService from "./services/solana.service";
import CardanoService from "./services/cardano.service";
import HydraService from "./services/hydra.service";
import connectQueue from "./services/amqp.service";

const app = express();

app.use(json());

const PORT = process.env.PORT || 3000;

app.use(router);

const blockchainSelected = process.env.BLOCKCHAIN;

// Windows-specific handling for SIGINT
if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

/**
 * Initializes the blockchain services based on the blockchain selected in the environment.
 * Also starts the AMQP queue connection and the express server.
 * @async
 * @function initBlockchains
 * @returns {Promise<void>}
 */
const initBlockchains = async () => {
  if (blockchainSelected === "CARDANO") {
    await CardanoService.initCardano();
  } else if (blockchainSelected === "SOLANA") {
    await SolanaService.initSolana();
  } else if (blockchainSelected == "HYDRA") {
    await HydraService.initHydra();
  } else {
    throw new Error(
      `Blockchain ${blockchainSelected} is not configured properly`
    );
  }

  connectQueue()
    .then(() => {
      const start = performance.now();

      // Listen for SIGINT to gracefully exit the application
      process.on("SIGINT", function () {
        console.log("exit", performance.now());
        console.log("diff", performance.now() - start);
        process.exit(1);
      });

      app.listen(PORT, () =>
        console.log(`App listening at port ${PORT}`)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

initBlockchains();
