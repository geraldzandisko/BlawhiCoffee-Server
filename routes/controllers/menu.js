const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
const fs = require("fs");

router.get("/daftarmenu", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_menu_pesanan` INNER JOIN `tbl_kategori_menu` ON `tbl_menu_pesanan`.`id_kategori` = `tbl_kategori_menu`.`id_kategori` WHERE `tbl_kategori_menu`.`nama_kategori` NOT IN ('Fitur') ORDER BY `tbl_kategori_menu`.`nama_kategori` ASC",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/daftarmakanan", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_menu_pesanan` INNER JOIN `tbl_kategori_menu` ON `tbl_menu_pesanan`.`id_kategori` = `tbl_kategori_menu`.`id_kategori` WHERE `tbl_kategori_menu`.`jenis_kategori` = 'makanan' ORDER BY `tbl_kategori_menu`.`nama_kategori` ASC",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/daftarminuman", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_menu_pesanan` INNER JOIN `tbl_kategori_menu` ON `tbl_menu_pesanan`.`id_kategori` = `tbl_kategori_menu`.`id_kategori` WHERE `tbl_kategori_menu`.`jenis_kategori` = 'minuman' ORDER BY `tbl_kategori_menu`.`nama_kategori` ASC",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/addMenu", (req, res) => {
  (namamenu = req.body.namamenu),
  (hargamenu = req.body.hargamenu),
  (diskon = req.body.diskon),
  (kategorimenu = req.body.kategorimenu),
  (ketersediaan = req.body.ketersediaan),
  (gambarmenu = req.body.gambarmenu);
  // Gambar
  var gambarmenu = req.body.gambarmenu;
  var d = Date.now();
  var filename = d + "_FOTOMENU.jpg";

  console.log(req.body);

  var binaryData = new Buffer.from(gambarmenu, "base64").toString("binary");
  fs.writeFile(
    __dirname + "/../../assets/photos/" + filename,
    binaryData,
    "binary",
    (err) => {}
  );
  conn.query(
    "INSERT INTO `tbl_menu_pesanan` (`id_menu`, `nama_menu`, `harga_menu`, `diskon`, `id_kategori`, `ketersediaan_menu`, `gambar_menu`) VALUES (NULL, ?, ?, ?, ?, ?, ?);",
    [namamenu, hargamenu, diskon, kategorimenu, ketersediaan, filename],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editMenu", (req, res) => {
  (idmenu = parseInt(req.body.idmenu)),
  (namamenu = req.body.namamenu),
  (hargamenu = req.body.hargamenu),
  (diskon = req.body.diskon),
  (kategorimenu = req.body.kategorimenu),
  (ketersediaan = req.body.ketersediaan),
  (gambarmenu = req.body.gambarmenu);
  // Gambar
  var gambarmenu = req.body.gambarmenu;
  var d = Date.now();
  var filename = d + "_FOTOMENU.jpg";

  console.log(req.body);

  var binaryData = new Buffer.from(gambarmenu, "base64").toString("binary");
  fs.writeFile(
    __dirname + "/../../assets/photos/" + filename,
    binaryData,
    "binary",
    (err) => {}
  );
  conn.query(
    "UPDATE `tbl_menu_pesanan` SET `nama_menu` = ?, `harga_menu` = ?, `diskon` = ?, `id_kategori` = ?, `ketersediaan_menu` = ?, `gambar_menu` = ? WHERE `tbl_menu_pesanan`.`id_menu` = ?;",
    [namamenu, hargamenu, diskon, kategorimenu, ketersediaan, filename, idmenu],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/editMenuNoPic", (req, res) => {
  (idmenu = parseInt(req.body.idmenu)),
  (namamenu = req.body.namamenu),
  (hargamenu = req.body.hargamenu),
  (diskon = req.body.diskon),
  (kategorimenu = req.body.kategorimenu),
  (ketersediaan = req.body.ketersediaan),
  console.log(req.body);
  conn.query(
    "UPDATE `tbl_menu_pesanan` SET `nama_menu` = ?, `harga_menu` = ?, `diskon` = ?, `id_kategori` = ?, `ketersediaan_menu` = ? WHERE `tbl_menu_pesanan`.`id_menu` = ?;",
    [namamenu, hargamenu, diskon, kategorimenu, ketersediaan, idmenu],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/deleteMenu", (req, res) => {
  var namamenu = req.body.namamenu;
  conn.query(
    "DELETE FROM tbl_menu_pesanan WHERE nama_menu = ?",
    [namamenu],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/changeKetersediaan", (req, res) => {
  var ketersediaan = req.body.ketersediaan;
  var idmenu = req.body.idmenu;
  conn.query(
    "UPDATE `tbl_menu_pesanan` SET `ketersediaan_menu` = ? WHERE `tbl_menu_pesanan`.`id_menu` = ?;",
    [ketersediaan, idmenu],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

module.exports = router;
