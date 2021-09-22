const http = require("http");
const { json, urlencoded, response } = require("express");
const routing = require("./routes");
const express = require("express");
const app = express();
app.use("/image", express.static(__dirname + "/assets/photos"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
app.use(urlencoded({limit: '50mb', extended: true}));
app.use(json({limit: '50mb'}));
app.use("/", routing);

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log("Sistem Informasi Pengelolaan Warung Kopi");
  console.log(`Server berjalan di port ${PORT}`);
});
