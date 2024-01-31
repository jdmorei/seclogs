var express = require("express");
var router = express.Router();

const Logs = require("../model/log");

/* GET logs listing. */
router.get("/", async (req, res, next) => {
  const logs = await Logs.find();

  const json = logs.map((log) => {
    return {
      trx: log.trx ?? "",
      hash: log.hash ?? "",
      payload: log.payload ?? {},
      statusTrx: log.statusTrx ?? "pending",
      eventTime: log?.payload?.eventTime ?? "",
    };
  });
  console.log(json);
  res.send(json).status(200);
});

router.post("/", async (req, res, next) => {
  const value = req.body;

  await Logs.create({
    trx: value.trx,
    hash: value.hash,
    payload: value.payload,
    statusTrx: "pending",
    receivedTime: value.payload.date,
  });
  res.send("created").status(200);
});

module.exports = router;
