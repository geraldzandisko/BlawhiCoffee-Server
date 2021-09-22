const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");

router.post("/addCategory", (req, res) => {
  var namakategori = req.body.namakategori;
  var jeniskategori = req.body.jeniskategori;
  conn.query(
    "INSERT INTO `tbl_kategori_menu` (`id_kategori`, `nama_kategori`, `jenis_kategori`) VALUES (NULL, ?, ?);",
    [namakategori, jeniskategori],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.post("/deleteCategory", (req, res) => {
  var namakategori = req.body.namakategori;
  conn.query(
    "DELETE FROM `tbl_kategori_menu` WHERE nama_kategori = ?",
    [namakategori],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/kategori", (req, res) => {
  conn.query("SELECT * FROM `tbl_kategori_menu` WHERE `jenis_kategori` NOT IN ('Fitur')", (err, rows) => {
    res.json(rows);
  });
});

module.exports = router;
