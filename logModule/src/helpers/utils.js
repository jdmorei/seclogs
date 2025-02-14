import axios from "axios";
const { performance } = require("perf_hooks"); 
import CARDANO from "../services/cardano.service";
import SOLANA from "../services/solana.service"; 
import HYDRA from "../services/hydra.service"; 
const crypto = require("crypto"); 
import dotenv from "dotenv";
dotenv.config(); 

let cont = 1; // Counter to keep track of invocation logs

/**
 * Processes raw log data, sends it to a blockchain, and then posts it to a server if successful.
 * @param {Object|string} req - Request that contains the raw log data.
 */
const readAndSentLog = async (req) => {
  const startTime = performance.now(); 

  // Retrieve the blockchain type from environment variables
  const blockchainSelected = process.env.BLOCKCHAIN;

  let values = null;
  // Determine if the request is a string or an object, then split by "||" to extract log fields
  if (typeof req !== "string") {
    values = req.rawData.split("||");
  } else {
    values = req.split("||");
  }

  values = values.map((value) => value.trim());

  const now = Date.now(); 
  // Construct the log payload by mapping values to corresponding log fields
  const payload = {
    syslogFacility: values[0],
    syslogSeverity: values[1],
    eventTime: values[2],
    milliseconds: values[3],
    hostname: values[4],
    sourceName: values[5],
    processID: values[6],
    message: values[7],
    status: values[8],
    reason: values[9],
    sourceIPAddress: values[10],
    protocol: "",
    payloadRAW: values[12],
    date: new Date(now), 
    dateMillis: new Date(now).getUTCMilliseconds(), 
  };

  // Create a SHA-256 hash from the JSON-stringified payload
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  let result = null;
  const startBlockchain = performance.now(); // Start timer for blockchain operations

  // Depending on which blockchain is configured, execute the corresponding log write operation
  if (blockchainSelected === "CARDANO") {
    let flag = true;

    while (flag) {
      result = await CARDANO.writeLog(hash);
      if (!result) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        flag = false; 
      }
    }
  } else if (blockchainSelected === "SOLANA") {
    result = await SOLANA.writeLog();

    // Compute an HMAC using the returned transaction id and the generated hash
    const hmac = crypto
      .createHmac("sha1", result.id)
      .update(hash)
      .digest("hex");
    result.hmac = hmac; 
  } else if (blockchainSelected === "HYDRA") {
    // Write log on Hydra blockchain
    result = await HYDRA.writeLogHydra(hash);
  } else {
    throw new Error(
      `Blockchain ${blockchainSelected} was not configured properly`
    );
  }
  const endBlockchain = performance.now(); 

  // If a valid transaction ID exists, send the log information to the server
  if (result?.id) {
    const response = await axios.post(process.env.SERVER_INFO_URL + "/logs", {
      trx: result.id,
      hash,
      payload,
    });
  }

  const endTime = performance.now(); // End timer for the whole function execution

  // Log the counter, total execution time, and blockchain operation time in milliseconds
  console.log(
    ` ${cont++}, ${endTime - startTime} , ${endBlockchain - startBlockchain} `
  );
};

export default readAndSentLog;
