"use strict";
import express from "express";

var myRawParser = function (req, res, next) {
  req.rawData = "";

  req.on("data", function (chunk) {
    req.rawData += chunk;
  });
  req.on("end", function () {
    next();
  });
};

express.urlencoded();

const router = express.Router();
router.use(myRawParser);

router.get("/", async (req, res) => {
  res.json({ status: true, message: "Our node.js app works" });
});



export default router;
