const express = require("express");
const router = express.Router();
const sqlHelper = require("../mysqlHelper");
var moment = require("moment");
moment().format();
const conn = require("../mysqlConnection");

router.get("/getPengeluaranNow", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_pengeluaran` WHERE `tanggal_pengeluaran` = CURRENT_DATE() AND `status_pengeluaran` = 'pending' ORDER BY `jenis_pengeluaran` DESC",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/totPengeluaranKasir", (req, res) => {
  conn.query(
    "SELECT (SELECT IFNULL(SUM(`harga_pengeluaran`), 0) FROM `tbl_pengeluaran` WHERE `jenis_pengeluaran` = 'limit' AND `tanggal_pengeluaran` = CURDATE() AND `status_pengeluaran` = 'dikonfirmasi') AS TotalKonfirmasi, (SELECT IFNULL(SUM(`harga_pengeluaran`), 0) FROM `tbl_pengeluaran` WHERE `jenis_pengeluaran` = 'limit' AND `tanggal_pengeluaran` = CURDATE() AND `status_pengeluaran` = 'pending') AS TotalPending;",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/addPengAdmin", (req, res) => {
  var keterangan = req.body.keterangan;
  var harga = req.body.harga;
  conn.query(
    "INSERT INTO `tbl_pengeluaran` (`id_pengeluaran`, `tanggal_pengeluaran`, `keterangan_pengeluaran`, `jenis_pengeluaran`, `harga_pengeluaran`, `status_pengeluaran`) VALUES (NULL, CURRENT_DATE(), ?, 'admin', ?, 'pending');",
    [keterangan, harga],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/getPengeluaranOverlimit", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_pengeluaran` WHERE `jenis_pengeluaran` = 'overlimit' AND `tanggal_pengeluaran` = CURDATE() AND `status_pengeluaran` = 'pending'",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/addOverlimit", (req, res) => {
  var id = req.body.id;
  conn.query(
    "UPDATE `tbl_pengeluaran` SET `status_pengeluaran` = 'dikonfirmasi' WHERE `tbl_pengeluaran`.`id_pengeluaran` = ?;",
    [id],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/deleteOverlimit", (req, res) => {
  var id = req.body.id;
  conn.query(
    "DELETE FROM `tbl_pengeluaran` WHERE `tbl_pengeluaran`.`id_pengeluaran` = ?",
    [id],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/addPengKasir", (req, res) => {
  var keterangan = req.body.keterangan;
  var jenis = req.body.jenis;
  var harga = req.body.harga;
  conn.query(
    "INSERT INTO `tbl_pengeluaran` (`id_pengeluaran`, `tanggal_pengeluaran`, `keterangan_pengeluaran`, `jenis_pengeluaran`, `harga_pengeluaran`, `status_pengeluaran`) VALUES (NULL, CURRENT_DATE(), ?, ?, ?, 'pending');",
    [keterangan, jenis, harga],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/confPengKasir", (req, res) => {
  conn.query(
    "UPDATE `tbl_pengeluaran` SET `status_pengeluaran` = 'dikonfirmasi' WHERE (`jenis_pengeluaran` = 'limit' or `jenis_pengeluaran` = 'admin') AND `tanggal_pengeluaran` = CURRENT_DATE();",
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/confPengAdmin", (req, res) => {
  conn.query(
    "UPDATE `tbl_pengeluaran` SET `status_pengeluaran` = 'dikonfirmasi' WHERE `tanggal_pengeluaran` = CURRENT_DATE();",
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/deletePengeluaran", (req, res) => {
  var idpengeluaran = req.body.idpengeluaran;
  conn.query(
    "DELETE FROM `tbl_pengeluaran` WHERE `tbl_pengeluaran`.`id_pengeluaran` = ?",
    [idpengeluaran],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editPengaturan", (req, res) => {
  var tanggal = moment(req.body.tanggal).format("YYYY-MM-DD");
  var nominal = req.body.nominal;
  conn.query(
    "UPDATE `tbl_pengaturan_pengeluaran` SET `tanggal_berlaku` = ?, `nominal_baru` = ? WHERE `tbl_pengaturan_pengeluaran`.`id_pengaturanpeng` = 1;",
    [tanggal, nominal],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/details", async (req, res) => {
  var id_pengaturan = req.query.id_pengaturan;
  var result = await sqlHelper.getPengaturanPengeluaran(req.query);
  res.send(result);
});

router.put("/update", async (req, res) => {
  const body = req.body;
  let result = await sqlHelper.doUpdate(
    "tbl_pengaturan_pengeluaran",
    {
      nominal_baru: body.nominal_baru,
      tanggal_berlaku: body.tanggal_berlaku,
    },
    "id_pengaturanpeng",
    body.id_pengaturan
  );
  res.send(result);
});

module.exports = router;
