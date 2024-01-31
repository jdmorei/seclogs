import axios from "axios";
const { performance } = require("perf_hooks");
import CARDANO from "../services/cardano.service";
import SOLANA from "../services/solana.service";
import HYDRA from "../services/hydra.service";
const crypto = require("crypto");
import dotenv from "dotenv";
dotenv.config();

let cont = 1;

const readAndSentLog = async (req) => {
  const startTime = performance.now();

  const blockchainSelected = process.env.BLOCKCHAIN;

  let values = null;
  if (typeof req !== "string") {
    values = req.rawData.split("||");
  } else {
    values = req.split("||");
  }

  values = values.map((value) => value.trim());

  const now = Date.now();
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

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  let result = null;
  const startBlockchain = performance.now();

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

    const hmac = crypto
      .createHmac("sha1", result.id)
      .update(hash)
      .digest("hex");
    result.hmac = hmac;
  } else if (blockchainSelected === "HYDRA") {
    result = await HYDRA.writeLogHydra(hash);
  } else {
    throw new Error(
      `Blockchain ${blockchainSelected} was not configured properly`
    );
  }
  const endBlockchain = performance.now();

  if (result?.id) {
    const response = await axios.post(process.env.SERVER_INFO_URL + "/logs", {
      trx: result.id,
      hash,
      payload,
    });
  }

  const endTime = performance.now();

  console.log(
    ` ${cont++}, ${endTime - startTime} , ${endBlockchain - startBlockchain} `
  );

};

export default readAndSentLog;
