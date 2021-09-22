const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");

router.get("/", async function (req, res) {
  return res.status(200).json(e);
});

router.get("/nomormeja", (req, res) => {
  conn.query("SELECT * FROM `tbl_nomor_meja`", (err, rows) => {
    res.json(rows);
  });
});

router.post("/addTable", (req, res) => {
  var nomortable = req.body.nomortable;
  var jumlahpel = req.body.jumlahpel;
  var ketersediaan = req.body.ketersediaan;
  conn.query(
    "INSERT INTO `tbl_nomor_meja` (`id_nomor_meja`, `nomor_meja`, `maksimal_pelanggan`, `ketersediaan_meja`) VALUES (NULL, ?, ?, ?);",
    [nomortable, jumlahpel, ketersediaan],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editTable", (req, res) => {
  var nomortable = req.body.nomortable;
  var jumlahpel = req.body.jumlahpel;
  var ketersediaan = req.body.ketersediaan;
  var nomorid = parseInt(req.body.nomorid);
  conn.query(
    "UPDATE `tbl_nomor_meja` SET `nomor_meja` = ?, `maksimal_pelanggan` = ?, `ketersediaan_meja` = ? WHERE `tbl_nomor_meja`.`id_nomor_meja` = ?;",
    [nomortable, jumlahpel, ketersediaan, nomorid],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/deleteTable", (req, res) => {
  var nomortable = req.body.nomortable;
  conn.query(
    "DELETE FROM tbl_nomor_meja WHERE nomor_meja = ?",
    [nomortable],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

module.exports = router;
