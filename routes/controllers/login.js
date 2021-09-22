const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");

// LOGIN
router.get("/statuslogin", (req, res) => {
  conn.query(
    "SELECT * FROM `tbl_status_login` ORDER BY `isLoggedIn` ASC",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/login", (req, res) => {
  conn.query(
    "UPDATE `tbl_status_login` as TblStatus, `tbl_fitur_kopi_gratis` AS TblGratis SET TblStatus.isLoggedIn = 'true', TblGratis.tanggal_layanan = CURDATE() WHERE TblStatus.statuslogin_id = 1 AND TblGratis.fiturkopi_id = 1",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/loginAuth", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var wewenang = req.body.wewenang;
  if (username && password && wewenang) {
    conn.query(
      "SELECT * FROM `tbl_user` WHERE username = ? AND password = ? AND wewenang = ?",
      [username, password, wewenang],
      function (error, results, fields) {
        if (results.length > 0) {
          res.send("Ada");
        } else {
          res.send("Tidak ada");
        }
        res.end();
      }
    );
  }
});

router.post("/logout", (req, res) => {
  conn.query(
    "UPDATE `tbl_status_login` as TblStatus SET TblStatus.isLoggedIn = 'false' WHERE TblStatus.statuslogin_id = 1",
    (err, rows) => {
      res.json(rows);
    }
  );
});

module.exports = router;
