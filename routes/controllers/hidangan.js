const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");

router.get("/getHidanganNominal", (req, res) => {
  conn.query("SELECT * FROM `tbl_fitur_kopi_spesial`", (err, rows) => {
    res.json(rows);
  });
});

router.post("/editHidangan", (req, res) => {
  var jumlah = req.body.jumlah;
  conn.query(
    "UPDATE `tbl_fitur_kopi_spesial` SET `minimal_total` = ? WHERE `tbl_fitur_kopi_spesial`.`fiturhidangan_id` = 1;",
    [jumlah],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/changeHidanganStatus", (req, res) => {
  var status = req.body.status;
  conn.query(
    "UPDATE `tbl_fitur_kopi_spesial` SET `status_fitur` = ? WHERE `tbl_fitur_kopi_spesial`.`fiturhidangan_id` = 1;",
    [status],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

module.exports = router;
