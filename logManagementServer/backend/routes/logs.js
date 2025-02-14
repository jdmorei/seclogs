var express = require("express");
var router = express.Router();

const Logs = require("../model/log");

/**
 * GET / route.
 * Fetches all log entries from the database, maps the log properties,
 * and returns the result as JSON with status 200.
 *
 * @route {GET} /
 * @returns {Object[]} Array of log objects.
 */
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
  res.status(200).send(json);
});

/**
 * POST / route.
 * Creates a new log entry in the database using the provided request body,
 * sets the status to "pending", and responds with a "created" message and status 200.
 *
 * @route {POST} /
 * @param {object} req.body - Payload containing log information.
 * @returns {string} "created"
 */
router.post("/", async (req, res, next) => {
  const value = req.body;

  await Logs.create({
    trx: value.trx,
    hash: value.hash,
    payload: value.payload,
    statusTrx: "pending",
    receivedTime: value.payload.date,
  });
  res.status(200).send("created");
});

module.exports = router;
