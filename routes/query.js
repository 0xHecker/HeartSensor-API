const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  isAnomal: Boolean,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  date: { type: Date, default: Date.now },
});

const Data = mongoose.model("Data", dataSchema);

// async function createNewData() {
//   const data = new Data({
//     isAnomal: true,
//     location: {
//       type: "Point",
//       coordinates: [-73.97, 40.87],
//     },
//   });

router.use(express.urlencoded({ extended: true }));

router.get("/hi", async (req, res) => {
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
  let { isAnomal, latitude, longitude } = req.body;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  let isTrueSet = isAnomal === "true";
  let data = new Data({
    isAnomal: isTrueSet,
    location: {
      type: "Point",
      coordinates: [latitude, longitude],
    },
  });
  const result = await data.save();
  console.log(result);
  res.send(result);
});

// async function getData() {
//   const data = await Data.find({
//     date: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
//     isAnomal: true,
//   });
//   //{
//   //   $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
//   // }
//   console.log(data[0].location);
// }

// getData();

module.exports = router;
