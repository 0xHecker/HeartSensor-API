const express = require("express");
const mongoose = require("mongoose");
const query = require("./routes/query");
const app = express();

// require("prod")(app);

app.use(express.json());

const uri =
  "mongodb://shanmukh:shanmukh123@heartdata1-shard-00-00.p4bql.mongodb.net:27017,heartdata1-shard-00-01.p4bql.mongodb.net:27017,heartdata1-shard-00-02.p4bql.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-a8729b-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.use("/api/query", query);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
