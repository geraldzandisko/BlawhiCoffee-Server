const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
const sqlHelper = require("../mysqlHelper");

router.post("/doneOrderan", (req, res) => {
  var idorderan = req.body.idorderan;
  conn.query(
    "UPDATE `tbl_orderan` SET `status_orderan` = 'selesai' WHERE `tbl_orderan`.`id_orderan` = ?;",
    [idorderan],
    (err, rows, result) => {
      if (err) return res.json(err);
      else return res.json(result);
    }
  );
});

router.get("/get", async (req, res) => {
  let orderanHariIni = await sqlHelper.getTodayorders();
  let hasilAkhir = [];
  for (elemen in orderanHariIni) {
    let baris = orderanHariIni[elemen];

    // Find di hasilAkhir sudah ada belum, kalau sudah ada maka append, jika tidak buat baru.
    const foundIndex = hasilAkhir.findIndex(
      (x) => x.id_pemesanan === baris.id_pemesanan
    );
    //  Jika tidak ketemu buat baru
    if (foundIndex < 0) {
      let detailMeja = await sqlHelper.findWithId(
        "tbl_nomor_meja",
        "id_nomor_meja",
        baris.id_nomor_meja
      );
      let tempObj = {
        id_pemesanan: baris.id_pemesanan,
        tanggal_pemesanan: baris.tanggal_pemesanan,
        nomor_pemesanan: baris.nomor_pemesanan,
        id_nomor_meja: baris.id_nomor_meja,
        status_pemesanan: baris.status_pemesanan,
        nomor_meja: detailMeja[0]["nomor_meja"],
        orderan: [
          {
            id_orderan: baris.id_orderan,
            status_orderan: baris.status_orderan,
            catatan_pesanan: baris.catatan_pesanan,
            nomor_orderan: baris.nomor_orderan,
            menus: [
              { nama_menu: baris.nama_menu, jumlah_menu: baris.jumlah_menu },
            ],
          },
        ],
      };
      hasilAkhir.push(tempObj);
    } else {
      // Append ke existing
      // Cek apakah id_orderan exists
      const foundSubIndex = hasilAkhir[foundIndex]["orderan"].findIndex(
        (x) => x.id_orderan === baris.id_orderan
      );

      //  Jika tidak ketemu buat baru
      if (foundSubIndex < 0) {
        let tempObj = {
          id_orderan: baris.id_orderan,
          status_orderan: baris.status_orderan,
          catatan_pesanan: baris.catatan_pesanan,
          nomor_orderan: baris.nomor_orderan,
          menus: [
            { nama_menu: baris.nama_menu, jumlah_menu: baris.jumlah_menu },
          ],
        };
        hasilAkhir[foundIndex]["orderan"].push(tempObj);
      } else {
        let tempMenu = {
          nama_menu: baris.nama_menu,
          jumlah_menu: baris.jumlah_menu,
        };
        hasilAkhir[foundIndex]["orderan"][foundSubIndex].menus.push(tempMenu);
      }
    }
  }
  res.send(hasilAkhir);
});

module.exports = router;
