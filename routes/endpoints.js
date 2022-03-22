const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const request = require("request");

const hereapikey = "qcpi8A4IUKQAummiq9whhy_1ZlxPRCk1r1aE8gu8SoQ";
var revsearch = "https://revgeocode.search.hereapi.com/v1/revgeocode"; // ?at=48.2181679%2C16.3899064&lang=en-US&apikey=qcpi8A4IUKQAummiq9whhy_1ZlxPRCk1r1aE8gu8SoQ

var validateStatus = function (status) {
  var re = /(unresolved|helpfound|resolved)/;
  return re.test(status);
};

const dataSchema = new mongoose.Schema({
  deviceId: String,
  BPM: Number,
  helpStatus: {
    type: String,
    default: "unresolved",
    validate: [
      validateStatus,
      "Status must be unresolved, helpfound or resolved",
    ],
    match: /(unresolved|helpfound|resolved)/,
  }, // unresolved, helpfound, resolved
  isAnomal: Boolean,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  date: { type: Date, default: Date.now },
});

const Data = mongoose.model("Data", dataSchema);

router.use(express.urlencoded({ extended: true }));

router.get("/fetchanomal", async (req, res) => {
  const data = await Data.find({
    date: {
      $lt: Date.now(),
      $gt: new Date(Date.now() - 60 * 60 * 1000),
    },
    isAnomal: true,
  });

  //{
  //   $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
  // }
  res.send(data);
  console.log(data);
});

router.post("/post", async (req, res) => {
  let { isAnomal, latitude, longitude, BPM, helpStatus, deviceId } = req.body;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  BPM = parseInt(BPM);
  let isTrueSet = isAnomal === "true";

  let datas = new Data({
    isAnomal: isTrueSet,
    BPM: BPM,
    helpStatus: helpStatus,
    deviceId: deviceId,
    location: {
      type: "Point",
      coordinates: [latitude, longitude],
    },
  });

  const result = await datas.save();

  let str = `${revsearch}?at=${result.location.coordinates[0]}%2C${result.location.coordinates[1]}&lang=en-US&apikey=${hereapikey}`;
  console.log(str);
  let rest = await axios.get(str);
  console.log(rest.data.items[0].address);

  console.log(result);
  res.send(result);
});

router.put("/update/:id/:status", async (req, res) => {
  const { id, status } = req.params;
  if (
    status !== "resolved" ||
    status !== "unresolved" ||
    status !== "helpfound"
  ) {
    res.status(400);
    res.send("invalid input");
  }
  const data = await Data.findByIdAndUpdate(id, { helpStatus: status });
  res.send(data);
});

// const reqFromApi = (callback) => {
//   request(str, { json: true }, (err, res, body) => {
//     if (err) {
//       console.log(callback(err));
//       return callback(err);
//     }
//     console.log(res.body);
//     return callback(body);
//   });
// };

async function getData() {
  console.log("---- start ----");

  const data = await Data.find({
    date: {
      $lt: Date.now(),
      $gt: new Date(Date.now() - 2 * 60 * 1000),
    },
    isAnomal: true,
  });

  console.log(data);

  console.log("---- end ----");
  console.log(" ");
}

let interval = setInterval(getData, 2 * 60 * 1000);

module.exports = router;
