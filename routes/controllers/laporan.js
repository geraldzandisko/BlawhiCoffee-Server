const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
var moment = require("moment");
moment().format();
const sqlHelper = require("../mysqlHelper");

const removeTime = (dateTime) => {
  let date = new Date(dateTime.getTime());
  date.setHours(0, 0, 0, 0);
  return date;
};

router.get("/detailRiwayat", async (req, res) => {
  var idpemesanan = req.query.id;
  conn.query(
    "SELECT *, SUM(PSN.jumlah_menu) AS QTY, SUM(PSN.harga_menu * PSN.jumlah_menu) AS Total FROM `tbl_pemesanan` AS HDR INNER JOIN `tbl_nomor_meja` AS MJ ON HDR.id_nomor_meja = MJ.id_nomor_meja INNER JOIN `tbl_orderan` AS ORD ON HDR.id_pemesanan = ORD.id_pemesanan INNER JOIN `tbl_pesanan` AS PSN ON PSN.id_orderan = ORD.id_orderan INNER JOIN `tbl_menu_pesanan` AS MENU ON PSN.id_menu = MENU.id_menu WHERE `HDR`.`id_pemesanan` = ? GROUP BY `PSN`.`id_menu`;",
    [idpemesanan],
    (err, rows) => {
      let result = [];
      for (let elemen in rows) {
        let sementara = rows[elemen];
        let temp = {
          pesanan: sementara.nama_menu,
          harga: sementara.harga_menu,
          qty: sementara.QTY,
        };
        result.push(temp);
      }
      res.json(result);
    }
  );
});

router.get("/detailHeadRiwayat", async (req, res) => {
  var idpemesanan = req.query.id;
  conn.query(
    "SELECT *, SUM(PSN.jumlah_menu) AS QTY, SUM(PSN.harga_menu * PSN.jumlah_menu) AS Total FROM `tbl_pemesanan` AS HDR INNER JOIN `tbl_nomor_meja` AS MJ ON HDR.id_nomor_meja = MJ.id_nomor_meja INNER JOIN `tbl_orderan` AS ORD ON HDR.id_pemesanan = ORD.id_pemesanan INNER JOIN `tbl_pesanan` AS PSN ON PSN.id_orderan = ORD.id_orderan WHERE `HDR`.`id_pemesanan` = ?;",
    [idpemesanan],
    (err, rows) => {
      let result = [];
      for (let elemen in rows) {
        let sementara = rows[elemen];
        let temp = {
          tanggal: sementara.tanggal_pemesanan,
          nopesanan: sementara.nomor_pemesanan,
          nomeja: sementara.nomor_meja,
          pelanggan: sementara.jumlah_pelanggan,
          total: sementara.Total,
          status: sementara.status_pemesanan,
          keluhan: sementara.keluhan,
          dibayar: sementara.dibayar,
          kembalian: sementara.kembalian,
        };
        result.push(temp);
      }
      res.json(result);
    }
  );
});

router.post("/riwayatPembayaran", (req, res) => {
  var begin = new Date(req.body.begin);
  var end = new Date(req.body.end);
  conn.query(
    "SELECT PMSN.*, MEJA.*, SUM(PSN.harga_menu * PSN.jumlah_menu) harga_total from tbl_pemesanan PMSN INNER JOIN tbl_orderan ORDRN ON PMSN.id_pemesanan = ORDRN.id_pemesanan INNER JOIN tbl_pesanan PSN ON ORDRN.id_orderan = PSN.id_orderan INNER JOIN tbl_nomor_meja MEJA ON PMSN.id_nomor_meja = MEJA.id_nomor_meja WHERE (PMSN.status_pemesanan = 'lunas' OR PMSN.status_pemesanan = 'dibatalkan') AND DATE(PMSN.tanggal_pemesanan) between ? and ? GROUP BY PMSN.id_pemesanan;",
    [begin, end],
    (err, rows, result) => {
      return res.json(rows);
    }
  );
});

router.post("/riwayatPengeluaran", (req, res) => {
  var begin = new Date(req.body.begin);
  var end = new Date(req.body.end);
  conn.query(
    "SELECT * FROM `tbl_pengeluaran` WHERE `tanggal_pengeluaran` between ? and ? AND `status_pengeluaran` = 'dikonfirmasi'",
    [begin, end],
    (err, rows, result) => {
      return res.json(rows);
    }
  );
});

router.get("/rpMinMax", (req, res) => {
  conn.query(
    "SELECT DATE(MAX(tanggal_pemesanan)) AS MAX, DATE(MIN(tanggal_pemesanan)) AS MIN FROM `tbl_pemesanan`",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/rpeMinMax", (req, res) => {
  conn.query(
    "SELECT DATE(MAX(tanggal_pengeluaran)) AS MAX, DATE(MIN(tanggal_pengeluaran)) AS MIN FROM `tbl_pengeluaran`",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/uangMinMax", (req, res) => {
  conn.query(
    "SELECT min(mn) AS MIN, max(mx) AS MAX FROM (SELECT max(tanggal_pemesanan) AS `mx`, min(tanggal_pemesanan) AS `mn` FROM tbl_pemesanan where status_pemesanan = 'lunas' UNION SELECT max(tanggal_pengeluaran) AS `mx`, min(tanggal_pengeluaran) AS `mn` FROM tbl_pengeluaran where status_pengeluaran = 'dikonfirmasi') AS t1;",
    (err, rows) => {
      res.json(rows);
    }
  );
});

function compare(a, b) {
  const bandA = a.tanggal;
  const bandB = b.tanggal;

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison;
}

router.post("/get", async (req, res) => {
  date = new Date(req.body.date);
  let penjualan = await sqlHelper.getPenjualanBetween(date);
  let pembelian = await sqlHelper.getPengeluaranDikonfirmasi(date);
  let hasilAkhir = {
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo_akhir: 0,
    detail: [],
  };
  // Push baris penjualan
  for (indeks in penjualan) {
    let baris = penjualan[indeks];
    let tempObj = {
      tanggal: removeTime(baris.tanggal_pemesanan),
      pemasukan: `Pesanan #${baris.id_pemesanan} nomor ${baris.nomor_pemesanan}`,
      totalpemasukan: baris.harga_total,
      pengeluaran: "",
      totalpengeluaran: "",
    };
    hasilAkhir["total_pemasukan"] += baris.harga_total;
    hasilAkhir["detail"].push(tempObj);
  }
  //   Push baris pembelian
  for (indeks in pembelian) {
    let baris = pembelian[indeks];
    let tempObj = {
      tanggal: baris.tanggal_pengeluaran,
      pemasukan: "",
      totalpemasukan: "",
      pengeluaran: baris.keterangan_pengeluaran,
      totalpengeluaran: baris.harga_pengeluaran,
    };
    hasilAkhir["total_pengeluaran"] += baris.harga_pengeluaran;
    hasilAkhir["detail"].push(tempObj);
  }
  hasilAkhir["saldo_akhir"] =
    hasilAkhir["total_pemasukan"] - hasilAkhir["total_pengeluaran"];
  hasilAkhir["detail"].sort(compare);
  res.send(hasilAkhir);
});

router.post("/summaryKeuangan", async (req, res) => {
  date = new Date(req.body.date);
  let penjualan = await sqlHelper.getSummaryPenjualanBetween(date);
  let pembelian = await sqlHelper.getSummaryPengeluaranDikonfirmasi(date);
  let hasilAkhir = {
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo_akhir: 0,
    detail: [],
  };
  // Push baris penjualan
  for (indeks in penjualan) {
    let baris = penjualan[indeks];
    let tempObj = {
      tanggal: removeTime(baris.tanggal_pemesanan),
      totalpemasukan: baris.harga_total,
      totalpengeluaran: 0,
    };
    hasilAkhir["total_pemasukan"] += baris.harga_total;
    hasilAkhir["detail"].push(tempObj);
  }
  //   Push baris pembelian
  for (indeks in pembelian) {
    let baris = pembelian[indeks];
    let indeksObj = hasilAkhir["detail"].findIndex(
      (x) =>
        x.tanggal.getTime() === removeTime(baris.tanggal_pengeluaran).getTime()
    );
    let tempObj = {};
    if (indeksObj < 0) {
      tempObj = {
        tanggal: baris.tanggal_pengeluaran,
        totalpemasukan: 0,
        totalpengeluaran: baris.harga_pengeluaran,
      };
    } else {
      hasilAkhir["detail"][indeksObj]["totalpengeluaran"] = baris.harga_pengeluaran;
      hasilAkhir["total_pengeluaran"] += baris.harga_pengeluaran;
    }
  }
  hasilAkhir["saldo_akhir"] = hasilAkhir["total_pemasukan"] - hasilAkhir["total_pengeluaran"];
  hasilAkhir["detail"].sort(compare);
  res.send(hasilAkhir);
});

module.exports = router;
