const express = require("express");
const router = express.Router();

const warung_routes = require("./controllers/warung");
const category_routes = require("./controllers/category");
const hidangan_routes = require("./controllers/hidangan");
const login_routes = require("./controllers/login");
const meja_routes = require("./controllers/meja");
const menu_routes = require("./controllers/menu");
const pesanan_routes = require("./controllers/pesanan");
const pengeluaran_routes = require("./controllers/pengeluaran");
const kopi_routes = require("./controllers/kopi_gratis");
const orderan_routes = require("./controllers/orderan");
const laporan_routes = require("./controllers/laporan");

router.use("/", warung_routes);
router.use("/", category_routes);
router.use("/", hidangan_routes);
router.use("/", login_routes);
router.use("/", meja_routes);
router.use("/", menu_routes);
// Disini router.use('/pesanan') sehingga semua route dari pesanan_routes (file di ./controllers/pesanan)
// otomatis akan memiliki path '/pesanan' didepannya.
// Cth: fungsi post '/tambah' di file pesanan_routes akan diakses menggunakan post pesanan/tambah
router.use("/pesanan", pesanan_routes);
router.use("/pengeluaran", pengeluaran_routes);
router.use("/kopi", kopi_routes);
router.use("/orderan", orderan_routes);
router.use("/laporan", laporan_routes);

module.exports = router;
