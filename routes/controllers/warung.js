const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
const fs = require("fs");

router.post("/addUser", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var wewenang = req.body.wewenang;
  conn.query(
    "INSERT INTO `tbl_user` (`id_user`, `username`, `password`, `wewenang`) VALUES (NULL, ?, ?, ?);",
    [username, password, wewenang],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editWarungName", (req, res) => {
  var name = req.body.name;
  conn.query(
    "UPDATE `tbl_warung_kopi` SET `nama_warung_kopi` = ? WHERE `tbl_warung_kopi`.`id_warung_kopi` = 1;",
    [name],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editCoverWarung", (req, res) => {
  // Gambar
  var gambarcover = req.body.gambarcover;
  var d = Date.now();
  var filename = d + "_COVER.jpg";

  console.log(req.body);

  var binaryData = new Buffer.from(gambarcover, "base64").toString("binary");
  fs.writeFile(
    __dirname + "/../../assets/photos/" + filename,
    binaryData,
    "binary",
    (err) => {}
  );
  conn.query(
    "UPDATE `tbl_warung_kopi` SET `cover_warung_kopi` = ? WHERE `tbl_warung_kopi`.`id_warung_kopi` = 1;",
    [filename],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});


router.post("/editLogoWarung", (req, res) => {
  // Gambar
  var gambarlogo = req.body.gambarlogo;
  var d = Date.now();
  var filename = d + "_LOGO.jpg";

  console.log(req.body);

  var binaryData = new Buffer.from(gambarlogo, "base64").toString("binary");
  fs.writeFile(
    __dirname + "/../../assets/photos/" + filename,
    binaryData,
    "binary",
    (err) => {}
  );
  conn.query(
    "UPDATE `tbl_warung_kopi` SET `logo_warung_kopi` = ? WHERE `tbl_warung_kopi`.`id_warung_kopi` = 1;",
    [filename],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/warunginfo", (req, res) => {
    conn.query("SELECT * FROM `tbl_warung_kopi`", (err, rows) => {
      res.json(rows);
    });
  });

module.exports = router;
