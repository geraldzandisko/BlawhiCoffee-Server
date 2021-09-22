const conn = require("./mysqlConnection");

// Async dan promise agar menunggu hasil dikembalikan setelah insert
const doInsert = async (table, itemSet) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO ${table} SET ?`, itemSet, (err, rows, result) => {
      if (err) {
        throw err;
      } else {
        resolve(rows);
      }
    });
  });
};

const doUpdate = async (table, itemSet, idKey, id) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `UPDATE ${table} SET ? WHERE ${idKey} = ?`,
      [itemSet, id],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const findWithId = async (table, idKey, id) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM ${table} WHERE ${idKey} = ?`,
      [id],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const insertPemesanan = async (body) => {
  //   using set and item body, make sure the body fits the table needed
  body["tanggal_pemesanan"] = new Date();
  body["status_pemesanan"] = "pending";
  let rowResult = await doInsert("tbl_pemesanan", body);
  return rowResult;
};

const insertOrderan = async (body) => {
  body["tanggal_orderan"] = new Date();
  body["status_orderan"] = "sedang diproses";
  let rowResult = await doInsert("tbl_orderan", body);
  return rowResult;
};

const insertPesanan = async (body) => {
  let rowResult = await doInsert("tbl_pesanan", body);
  return rowResult;
};

const getPengaturanPengeluaran = async (body) => {
  var id_pengaturan = body.id_pengaturan;
  console.log(id_pengaturan);
  let rowResult = await findWithId(
    "tbl_pengaturan_pengeluaran",
    "id_pengaturanpeng",
    id_pengaturan
  );
  let nominalSama =
    rowResult[0]["maksimal_pengeluaran"] == rowResult[0]["nominal_baru"];
  // Jika tanggal berlaku dibawah dari saat ini maka:
  if (rowResult[0]["tanggal_berlaku"] < new Date() && !nominalSama) {
    // Lakukan update pada pengeluaran
    await doUpdate(
      "tbl_pengaturan_pengeluaran",
      { maksimal_pengeluaran: rowResult[0]["nominal_baru"] },
      "id_pengaturanpeng",
      id_pengaturan
    );

    // Ubah secara lokal
    rowResult[0]["maksimal_pengeluaran"] = rowResult[0]["nominal_baru"];
  }
  return rowResult;
};

const getPesananCount = () => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT count(*) as 'count' FROM `tbl_pemesanan` WHERE date(tanggal_pemesanan) = CURDATE()",
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getOrderanCount = (idPemesanan) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT count(*) as count FROM `tbl_orderan` WHERE id_pemesanan = ?",
      [idPemesanan],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getLatestPemesanan = async (id_nomor_meja) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT * FROM tbl_pemesanan WHERE id_nomor_meja = ? AND Date(tanggal_pemesanan) = CURDATE() ORDER BY id_pemesanan DESC LIMIT 1;",
      [id_nomor_meja],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getKopiGratisConfig = async () => {
  return new Promise((resolve, reject) => {
    conn.query("SELECT * FROM tbl_fitur_kopi_gratis", (err, rows, result) => {
      if (err) {
        throw err;
      } else {
        resolve(rows);
      }
    });
  });
};

const tambahKopiGratis = async () => {
  let conf = await getKopiGratisConfig();
  await doUpdate(
    "tbl_fitur_kopi_gratis",
    {
      perhitungan_layanan: conf[0].perhitungan_layanan + 1,
    },
    "fiturkopi_id",
    1
  );
};

const batalkanPemesanan = async (id_pemesanan, body) => {
  await doUpdate(
    "tbl_pemesanan",
    { status_pemesanan: "dibatalkan", keluhan: body.keluhan },
    "id_pemesanan",
    id_pemesanan
  );
  await doUpdate(
    "tbl_orderan",
    { status_orderan: "dibatalkan" },
    "id_pemesanan",
    id_pemesanan
  );
};

const getTodayorders = async () => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT * FROM tbl_pemesanan pmsn INNER JOIN tbl_orderan ordr ON pmsn.id_pemesanan = ordr.id_pemesanan INNER JOIN tbl_pesanan psn ON ordr.id_orderan = psn.id_orderan INNER JOIN tbl_menu_pesanan menu ON psn.id_menu = menu.id_menu WHERE Date(pmsn.tanggal_pemesanan) = CURDATE() AND ordr.status_orderan = 'sedang diproses'",
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getPenjualanBetween = async (date) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT PMSN.*, MEJA.*, SUM(PSN.harga_menu * PSN.jumlah_menu) harga_total from tbl_pemesanan PMSN INNER JOIN tbl_orderan ORDRN ON PMSN.id_pemesanan = ORDRN.id_pemesanan INNER JOIN tbl_pesanan PSN ON ORDRN.id_orderan = PSN.id_orderan INNER JOIN tbl_nomor_meja MEJA ON PMSN.id_nomor_meja = MEJA.id_nomor_meja WHERE PMSN.status_pemesanan = 'lunas' AND DATE(PMSN.tanggal_pemesanan) = ? GROUP BY PMSN.id_pemesanan;",
      [date],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getPengeluaranDikonfirmasi = async (date) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT * FROM tbl_pengeluaran WHERE status_pengeluaran = 'dikonfirmasi' AND `tanggal_pengeluaran` = ?;",
      [date],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getSummaryPenjualanBetween = async (date) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT PMSN.*, MEJA.*, SUM(PSN.harga_menu * PSN.jumlah_menu) harga_total from tbl_pemesanan PMSN " +
        "INNER JOIN tbl_orderan ORDRN ON PMSN.id_pemesanan = ORDRN.id_pemesanan " +
        "INNER JOIN tbl_pesanan PSN ON ORDRN.id_orderan = PSN.id_orderan " +
        "INNER JOIN tbl_nomor_meja MEJA ON PMSN.id_nomor_meja = MEJA.id_nomor_meja " +
        "WHERE PMSN.status_pemesanan = 'lunas' " +
        "AND EXTRACT(YEAR_MONTH FROM DATE(PMSN.tanggal_pemesanan)) = EXTRACT(YEAR_MONTH FROM ?) GROUP BY DATE(PMSN.tanggal_pemesanan);",
      [date],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getSummaryPengeluaranDikonfirmasi = async (date) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT tanggal_pengeluaran, SUM(harga_pengeluaran) harga_pengeluaran FROM tbl_pengeluaran  " +
        "WHERE status_pengeluaran = 'dikonfirmasi' " +
        "AND EXTRACT(YEAR_MONTH FROM tanggal_pengeluaran) = EXTRACT(YEAR_MONTH FROM ?) " +
        "GROUP BY tanggal_pengeluaran;",
      [date],
      (err, rows, result) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      }
    );
  });
};

module.exports = {
  insertPemesanan,
  insertOrderan,
  insertPesanan,
  getPengaturanPengeluaran,
  doUpdate,
  getPesananCount,
  getOrderanCount,
  getLatestPemesanan,
  batalkanPemesanan,
  getKopiGratisConfig,
  tambahKopiGratis,
  getTodayorders,
  findWithId,
  getPenjualanBetween,
  getPengeluaranDikonfirmasi,
  getSummaryPengeluaranDikonfirmasi,
  getSummaryPenjualanBetween,
};
