const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
const sqlHelper = require("../mysqlHelper");

router.post("/changeKopiStatus", (req, res) => {
  var status = req.body.status;
  conn.query(
    "UPDATE `tbl_fitur_kopi_gratis` SET `status_fitur` = ? WHERE `tbl_fitur_kopi_gratis`.`fiturkopi_id` = 1;",
    [status],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/changeKopiJumlah", (req, res) => {
  var jumlah = parseInt(req.body.jumlah);
  conn.query(
    "UPDATE `tbl_fitur_kopi_gratis` SET `layanan_maksimal` = ? WHERE `tbl_fitur_kopi_gratis`.`fiturkopi_id` = 1;",
    [jumlah],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/get", async (req, res) => {
  let conf = await sqlHelper.getKopiGratisConfig();
  const currDt = new Date();
  if (new Date(conf[0].tanggal_layanan).getDate() != currDt.getDate()) {
    sqlHelper.doUpdate(
      "tbl_fitur_kopi_gratis",
      {
        tanggal_layanan: currDt,
        perhitungan_layanan: 0,
      },
      "fiturkopi_id",
      1
    );
    conf.tanggal_layanan = currDt;
    conf.perhitungan_layanan = 0;
  }

  res.json(conf);
});

module.exports = router;
