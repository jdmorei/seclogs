const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    trx: String,
    hash: String,
    payload: Object,
    statusTrx: String,
    confirmedTime: Date,
    receivedTime: Date,
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
