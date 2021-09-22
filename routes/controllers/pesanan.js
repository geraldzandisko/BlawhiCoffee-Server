const express = require("express");
const router = express.Router();
const conn = require("../mysqlConnection");
const sqlHelper = require("../mysqlHelper");

router.get("/noPesananNow", (req, res) => {
  conn.query(
    "SELECT count(*) as 'count' FROM `tbl_pemesanan` WHERE date(tanggal_pemesanan) = CURDATE()",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.get("/pesananToday", (req, res) => {
  conn.query(
    "SELECT MEJA.*, PMSN.tanggal_pemesanan, SUM(PSN.harga_menu * PSN.jumlah_menu) harga_total from tbl_pemesanan PMSN INNER JOIN tbl_orderan ORDRN ON PMSN.id_pemesanan = ORDRN.id_pemesanan INNER JOIN tbl_pesanan PSN ON ORDRN.id_orderan = PSN.id_orderan INNER JOIN tbl_nomor_meja MEJA ON PMSN.id_nomor_meja = MEJA.id_nomor_meja WHERE PMSN.status_pemesanan = 'pending' AND DATE(PMSN.tanggal_pemesanan) = CURDATE() GROUP BY PMSN.id_nomor_meja",
    (err, rows) => {
      res.json(rows);
    }
  );
});

router.post("/selesaikan", async (req, res) => {
  let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(
    req.query.id_meja
  );
  let jumlahuang = parseInt(req.body.jumlahuang);
  let kembalian = parseInt(req.body.kembalian);
  console.log(row_pemesanan_terbaru);
  let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;
  sqlHelper.doUpdate(
    "tbl_pemesanan",
    { status_pemesanan: "lunas", dibayar: jumlahuang, kembalian: kembalian },
    "id_pemesanan",
    id_pemesanan_terbaru
  );

  sqlHelper.doUpdate(
    "tbl_orderan",
    { status_orderan: "selesai" },
    "id_pemesanan",
    id_pemesanan_terbaru
  );

  sqlHelper.doUpdate(
    "tbl_nomor_meja",
    { ketersediaan_meja: "kosong" },
    "id_nomor_meja",
    req.query.id_meja
  );

  res.send({
    message: "PESANAN DILUNASI",
  });
});

router.post("/batalkan", async (req, res) => {
  let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(
    req.query.id_meja
  );
  let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;
  await sqlHelper.batalkanPemesanan(id_pemesanan_terbaru, req.body);

  sqlHelper.doUpdate(
    "tbl_nomor_meja",
    { ketersediaan_meja: "kosong" },
    "id_nomor_meja",
    req.query.id_meja
  );

  res.send({
    message: "PESANAN DIBATALKAN",
  });
});

router.get("/detailStatus", async (req, res) => {
  let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(req.query.id);
  let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;

  conn.query(
    "SELECT * FROM `tbl_pemesanan` AS HDR INNER JOIN `tbl_nomor_meja` AS MJ ON HDR.id_nomor_meja = MJ.id_nomor_meja INNER JOIN `tbl_orderan` AS ORD ON HDR.id_pemesanan = ORD.id_pemesanan INNER JOIN `tbl_pesanan` AS PSN ON PSN.id_orderan = ORD.id_orderan INNER JOIN `tbl_menu_pesanan` AS MENU ON MENU.id_menu = PSN.id_menu WHERE `HDR`.`id_pemesanan` = ? GROUP BY `PSN`.`id_pesanan`",
    [id_pemesanan_terbaru],
    (err, rows) => {
      let hasilAkhir = [];
      for (elemen in rows) {
        let baris = rows[elemen];

        // Find di hasilAkhir sudah ada belum, kalau sudah ada maka append, jika tidak buat baru.
        const foundIndex = hasilAkhir.findIndex(
          (x) => x.id_pemesanan === baris.id_pemesanan
        );
        //  Jika tidak ketemu buat baru
        if (foundIndex < 0) {
          let tempObj = {
            id_pemesanan: baris.id_pemesanan,
            nomor_pemesanan: baris.nomor_pemesanan,
            id_nomor_meja: baris.id_nomor_meja,
            nomor_meja: baris.nomor_meja,
            orderan: [
              {
                id_orderan: baris.id_orderan,
                nomor_orderan: baris.nomor_orderan,
                status_orderan: baris.status_orderan,
                menus: [
                  {
                    nama_menu: baris.nama_menu,
                    jumlah_menu: baris.jumlah_menu,
                  },
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
            console.log("SUB ORDERAN SUDAH ADA");
            let tempObj = {
              id_orderan: baris.id_orderan,
              nomor_orderan: baris.nomor_orderan,
              status_orderan: baris.status_orderan,
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
            hasilAkhir[foundIndex]["orderan"][foundSubIndex].menus.push(
              tempMenu
            );
          }
        }
      }
      res.send(hasilAkhir);
    }
  );
});

router.get("/detailPesanan", async (req, res) => {
  let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(req.query.id);
  let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;
  conn.query(
    "SELECT *, SUM(PSN.jumlah_menu) AS QTY, SUM(PSN.harga_menu * PSN.jumlah_menu) AS Total FROM `tbl_pemesanan` AS HDR INNER JOIN `tbl_nomor_meja` AS MJ ON HDR.id_nomor_meja = MJ.id_nomor_meja INNER JOIN `tbl_orderan` AS ORD ON HDR.id_pemesanan = ORD.id_pemesanan INNER JOIN `tbl_pesanan` AS PSN ON PSN.id_orderan = ORD.id_orderan INNER JOIN `tbl_menu_pesanan` AS MENU ON PSN.id_menu = MENU.id_menu WHERE `HDR`.`id_pemesanan` = ? GROUP BY `PSN`.`id_menu`",
    [id_pemesanan_terbaru],
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

router.get("/detailHeadPesanan", async (req, res) => {
  let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(req.query.id);
  let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;

  conn.query(
    "SELECT `HDR`.`id_pemesanan` AS ID, MJ.nomor_meja AS nomormeja, HDR.tanggal_pemesanan AS tanggal, HDR.nomor_pemesanan AS nopemesanan, HDR.jumlah_pelanggan AS pelanggan, SUM(PSN.harga_menu * PSN.jumlah_menu) AS total FROM `tbl_pemesanan` AS HDR INNER JOIN `tbl_nomor_meja` AS MJ ON HDR.id_nomor_meja = MJ.id_nomor_meja INNER JOIN `tbl_orderan` AS ORD ON HDR.id_pemesanan = ORD.id_pemesanan INNER JOIN `tbl_pesanan` AS PSN ON PSN.id_orderan = ORD.id_orderan WHERE `HDR`.`id_pemesanan` = ?;",
    [id_pemesanan_terbaru],
    (err, rows) => {
      let result = [];
      for (let elemen in rows) {
        let sementara = rows[elemen];
        let temp = {
          idpesanan: sementara.ID,
          nomormeja: sementara.nomormeja,
          tanggal: sementara.tanggal,
          nopemesanan: sementara.nopemesanan,
          pelanggan: sementara.pelanggan,
          total: sementara.total,
        };
        result.push(temp);
      }
      res.json(result);
    }
  );
});

const buatOrderan = async (pemesanan_id, body) => {
  let orderCount = await sqlHelper.getOrderanCount(pemesanan_id);
  orderCount = orderCount[0].count;
  let orderan_body = {
    nomor_orderan: orderCount + 1,
    catatan_pesanan: body.catatan_pesanan,
  };
  let pesanan_body = {};

  // Insert ke orderan
  orderan_body["id_pemesanan"] = pemesanan_id;
  let result = await sqlHelper.insertOrderan(orderan_body);
  let orderan_id = result["insertId"];

  let menu_list = body.menus;
  // Looping data body
  for (let ind = 0; ind < menu_list.length; ind++) {
    console.log(menu_list[ind]["nama_menu"]);
    // Insert ke tbl_pesanan
    pesanan_body = {
      id_pemesanan: pemesanan_id,
      id_orderan: orderan_id,
      id_menu: menu_list[ind]["id_menu"],
      harga_menu: menu_list[ind]["harga_menu"],
      jumlah_menu: menu_list[ind]["jumlah_menu"],
    };
    result = await sqlHelper.insertPesanan(pesanan_body);
  }
};

// Route kesini menggunakan localhost:8000/pesanan/tambah (Cek di routes/index.js) baris 16
router.post("/tambah", async (req, res) => {
  let body = req.body;
  // Body dalam bentuk json mesti memenuhi ketentuan dibawah
  // body = {
  //   // id_pemesanan: 26, // Opsional, hanya ketika insert ke yang sudah ada saja baru di provide
  //   // jumlah_pelanggan: 4,
  //   // id_nomor_meja: 2,
  //   // keluhan: "",
  //   // catatan_pesanan: null,
  //   // menus: [
  //   //   {
  //   //     nama_menu: "Ikan Asam Manis",
  //   //     harga_menu: 45000,
  //   //     jumlah_menu: 2,
  //   //     total_harga: 90000,
  //   //   },
  //   //   {
  //   //     nama_menu: "French Fries",
  //   //     harga_menu: 25000,
  //   //     jumlah_menu: 3,
  //   //     total_harga: 75000,
  //   //   },
  //   //   {
  //   //     nama_menu: "Kopi Gratis",
  //   //     harga_menu: 0,
  //   //     jumlah_menu: 1,
  //   //     total_harga: 0,
  //   //   },
  //   // ],
  // };
  let result = null;

  let adaKopiTidak = body.menus.find((x) => x.nama_menu === "Kopi Gratis");
  if (adaKopiTidak) {
    console.log("ADA KOPI GRATIS, TAMBAH HITUNGAN");
    sqlHelper.tambahKopiGratis();
  }

  // Jika pemesanan baru (ada query ba1ru == true)
  if (req.query.baru == "true") {
    console.log("BUAT PEMESANAN BARU");
    let nomor_pemesanan_db = await sqlHelper.getPesananCount();
    nomor_pemesanan_db = nomor_pemesanan_db[0].count + 1;
    // Insert ke pemesanan
    // Membuat pemesanan baru
    let pemesanan_body = {
      nomor_pemesanan: nomor_pemesanan_db,
      jumlah_pelanggan: body.jumlah_pelanggan,
      id_nomor_meja: body.id_nomor_meja,
      total_harga: body.total_harga,
      keluhan: body.keluhan ? body.keluhan : "",
    };
    result = await sqlHelper.insertPemesanan(pemesanan_body);
    let pemesanan_id = result["insertId"];
    await buatOrderan(pemesanan_id, body);
  }
  // Jika bukan pemesanan baru (Artinya tambah order)
  else {
    console.log("TAMBAHKAN ORDER");
    let row_pemesanan_terbaru = await sqlHelper.getLatestPemesanan(
      body.id_nomor_meja
    );
    let id_pemesanan_terbaru = row_pemesanan_terbaru[0].id_pemesanan;
    let total_harga_sebelumnya = row_pemesanan_terbaru[0].total_harga;
    await buatOrderan(id_pemesanan_terbaru, body);
    
    sqlHelper.doUpdate(
      "tbl_pemesanan",
      { total_harga: total_harga_sebelumnya + body.total_harga },
      "id_pemesanan",
      id_pemesanan_terbaru
    );
  }

  sqlHelper.doUpdate(
    "tbl_nomor_meja",
    { ketersediaan_meja: "aktif" },
    "id_nomor_meja",
    body.id_nomor_meja
  );

  res.send({
    message: "INSERT DONE",
  });
});

module.exports = router;
