// const { BorrowingDetails, Matsus } = require("../models");
// const { response } = require("../helpers/response.formatter");
// const { Op } = require("sequelize");

// module.exports = {
//   // =========================
//   // CREATE
//   // =========================
//   create: async (req, res) => {
//     try {
//       const {
//         return_date,
//         information_need,
//         borrower_name,
//         borrower_instansi,
//         borrower_no_telp,
//         borrower_address,
//         borrower_category,
//         id_matsus,
//         total,
//       } = req.body;

//       if (!return_date || !borrower_name || !id_matsus || !total) {
//         return res
//           .status(400)
//           .json(
//             response(
//               400,
//               "return_date, borrower_name, id_matsus, dan total wajib diisi",
//             ),
//           );
//       }

//       const matsus = await Matsus.findOne({
//         where: { id: id_matsus },
//       });

//       if (!matsus) {
//         return res.status(404).json(response(404, "Barang tidak ditemukan"));
//       }

//       const data = await BorrowingDetails.create({
//         loan_date: new Date(),
//         return_date,
//         information_need: information_need || null,
//         status: "Dipinjam",
//         borrower_name,
//         borrower_instansi: borrower_instansi || null,
//         borrower_no_telp: borrower_no_telp || null,
//         borrower_address: borrower_address || null,
//         borrower_category: borrower_category || null,
//         id_matsus,
//         total,
//       });

//       const result = await BorrowingDetails.findOne({
//         where: { id: data.id },
//         include: [
//           {
//             model: Matsus,
//             attributes: ["id", "name"],
//           },
//         ],
//       });

//       return res
//         .status(201)
//         .json(response(201, "Data peminjaman berhasil ditambahkan", result));
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json(response(500, "Terjadi kesalahan pada server", error.message));
//     }
//   },

//   // =========================
//   // GET ALL
//   // =========================

//   getAll: async (req, res) => {
//     try {
//       const { page = 1, limit = 10, search = "" } = req.query;

//       // Konversi ke number
//       const pageNum = parseInt(page, 10);
//       const limitNum = parseInt(limit, 10);
//       const offset = (pageNum - 1) * limitNum;

//       // Filter kondisi pencarian
//       const whereCondition = {};
//       const whereMatsusCondition = {};

//       if (search) {
//         whereCondition[Op.or] = [
//           { borrower_name: { [Op.iLike]: `%${search}%` } }, // Gunakan Op.like jika menggunakan MySQL
//           { borrower_instansi: { [Op.iLike]: `%${search}%` } },
//         ];

//         whereMatsusCondition[Op.or] = [
//           { name: { [Op.iLike]: `%${search}%` } },
//           { code: { [Op.iLike]: `%${search}%` } },
//         ];
//       }

//       // Query database menggunakan findAndCountAll
//       const { count, rows } = await BorrowingDetails.findAndCountAll({
//         where: whereCondition,
//         include: [
//           {
//             model: Matsus,
//             attributes: ["id", "name", "code"],
//             where:
//               Object.keys(whereMatsusCondition).length > 0
//                 ? whereMatsusCondition
//                 : undefined,
//             required: false, // Set false agar data peminjaman tetap muncul meskipun filter search di tabel Matsus tidak cocok
//           },
//         ],
//         order: [["loan_date", "DESC"]],
//         limit: limitNum,
//         offset: offset,
//         distinct: true, // Mencegah perhitungan jumlah row terduplikasi akibat JOIN
//       });

//       // Kalkulasi total halaman
//       const totalPages = Math.ceil(count / limitNum);

//       return res.status(200).json(
//         response(200, "Data peminjaman berhasil diambil", {
//           total_items: count,
//           total_pages: totalPages,
//           current_page: pageNum,
//           limit: limitNum,
//           data: rows,
//         }),
//       );
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json(response(500, "Terjadi kesalahan pada server", error.message));
//     }
//   },

//   // =========================
//   // GET BY ID
//   // =========================
//   getById: async (req, res) => {
//     try {
//       const { id } = req.params;

//       const data = await BorrowingDetails.findOne({
//         where: { id },
//         include: [
//           {
//             model: Matsus,
//             attributes: ["id", "name"],
//           },
//         ],
//       });

//       if (!data) {
//         return res
//           .status(404)
//           .json(response(404, "Data peminjaman tidak ditemukan"));
//       }

//       return res
//         .status(200)
//         .json(response(200, "Detail peminjaman berhasil diambil", data));
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json(response(500, "Terjadi kesalahan pada server", error.message));
//     }
//   },

//   // =========================
//   // UPDATE
//   // =========================
//   update: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const {
//         return_date,
//         information_need,
//         borrower_name,
//         borrower_instansi,
//         borrower_no_telp,
//         borrower_address,
//         borrower_category,
//         id_matsus,
//         total,
//         status,
//       } = req.body;

//       const data = await BorrowingDetails.findOne({
//         where: { id },
//       });

//       if (!data) {
//         return res
//           .status(404)
//           .json(response(404, "Data peminjaman tidak ditemukan"));
//       }

//       if (id_matsus && Number(id_matsus) !== data.id_matsus) {
//         const matsus = await Matsus.findOne({
//           where: { id: id_matsus },
//         });

//         if (!matsus) {
//           return res.status(404).json(response(404, "Barang tidak ditemukan"));
//         }
//       }

//       const validStatus = [
//         "Dipinjam",
//         "Dikembalikan",
//         "Terlambat",
//         "Dibatalkan",
//       ];

//       if (status && !validStatus.includes(status)) {
//         return res
//           .status(400)
//           .json(
//             response(
//               400,
//               "Status hanya boleh Dipinjam, Dikembalikan, Terlambat, atau Dibatalkan",
//             ),
//           );
//       }

//       await data.update({
//         return_date: return_date !== undefined ? return_date : data.return_date,
//         information_need:
//           information_need !== undefined
//             ? information_need
//             : data.information_need,
//         borrower_name:
//           borrower_name !== undefined ? borrower_name : data.borrower_name,
//         borrower_instansi:
//           borrower_instansi !== undefined
//             ? borrower_instansi
//             : data.borrower_instansi,
//         borrower_no_telp:
//           borrower_no_telp !== undefined
//             ? borrower_no_telp
//             : data.borrower_no_telp,
//         borrower_address:
//           borrower_address !== undefined
//             ? borrower_address
//             : data.borrower_address,
//         borrower_category:
//           borrower_category !== undefined
//             ? borrower_category
//             : data.borrower_category,
//         id_matsus: id_matsus !== undefined ? id_matsus : data.id_matsus,
//         total: total !== undefined ? total : data.total,
//         status: status !== undefined ? status : data.status,
//       });

//       const result = await BorrowingDetails.findOne({
//         where: { id },
//         include: [
//           {
//             model: Matsus,
//             attributes: ["id", "name"],
//           },
//         ],
//       });

//       return res
//         .status(200)
//         .json(response(200, "Data peminjaman berhasil diperbarui", result));
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json(response(500, "Terjadi kesalahan pada server", error.message));
//     }
//   },

//   // =========================
//   // DELETE
//   // =========================
//   delete: async (req, res) => {
//     try {
//       const { id } = req.params;

//       const data = await BorrowingDetails.findOne({
//         where: { id },
//       });

//       if (!data) {
//         return res
//           .status(404)
//           .json(response(404, "Data peminjaman tidak ditemukan"));
//       }

//       await data.destroy();

//       return res
//         .status(200)
//         .json(response(200, "Data peminjaman berhasil dihapus"));
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(500)
//         .json(response(500, "Terjadi kesalahan pada server", error.message));
//     }
//   },
// };


const { BorrowingDetails, Matsus, sequelize } = require("../models");
const { response } = require("../helpers/response.formatter");
const { Op } = require("sequelize");

module.exports = {
  // =========================
  // CREATE (Tambah Peminjaman + Kurangi Stok)
  // =========================
  create: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const {
        return_date,
        information_need,
        borrower_name,
        borrower_instansi,
        borrower_no_telp,
        borrower_address,
        borrower_category,
        id_matsus,
        total,
      } = req.body;

      if (!return_date || !borrower_name || !id_matsus || !total) {
        await t.rollback();
        return res.status(400).json(
          response(
            400,
            "return_date, borrower_name, id_matsus, dan total wajib diisi"
          )
        );
      }

      // Cek barang
      const matsus = await Matsus.findOne({
        where: { id: id_matsus },
        transaction: t,
      });

      if (!matsus) {
        await t.rollback();
        return res.status(404).json(
          response(404, "Barang tidak ditemukan")
        );
      }

      // Cek ketersediaan stok
      if (matsus.available_item < total) {
        await t.rollback();
        return res.status(400).json(
          response(
            400,
            `Stok tidak mencukupi. Stok tersedia: ${matsus.available_item}`
          )
        );
      }

      // Create peminjaman
      const data = await BorrowingDetails.create(
        {
          loan_date: new Date(),
          return_date,
          information_need: information_need || null,
          status: "Dipinjam",
          borrower_name,
          borrower_instansi: borrower_instansi || null,
          borrower_no_telp: borrower_no_telp || null,
          borrower_address: borrower_address || null,
          borrower_category: borrower_category || null,
          id_matsus,
          total: Number(total),
        },
        { transaction: t }
      );

      // Kurangi stok Matsus
      await matsus.update(
        {
          available_item: matsus.available_item - Number(total),
        },
        { transaction: t }
      );

      await t.commit();

      // Get data + relasi Matsus
      const result = await BorrowingDetails.findOne({
        where: { id: data.id },
        include: [
          {
            model: Matsus,
            attributes: ["id", "name", "code", "foto"],
          },
        ],
      });

      return res.status(201).json(
        response(
          201,
          "Data peminjaman berhasil ditambahkan",
          result
        )
      );
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json(
        response(500, "Terjadi kesalahan pada server", error.message)
      );
    }
  },

  // =========================
  // GET ALL (Pagination & Search)
  // =========================
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      const whereCondition = {};
      const whereMatsusCondition = {};

      if (search) {
        // Ganti Op.iLike ke Op.like jika menggunakan MySQL
        whereCondition[Op.or] = [
          { borrower_name: { [Op.iLike]: `%${search}%` } },
          { borrower_instansi: { [Op.iLike]: `%${search}%` } },
        ];

        whereMatsusCondition[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await BorrowingDetails.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Matsus,
            attributes: ["id", "name", "code", "foto"],
            where: Object.keys(whereMatsusCondition).length > 0 ? whereMatsusCondition : undefined,
            required: false,
          },
        ],
        order: [["loan_date", "DESC"]],
        limit: limitNum,
        offset: offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limitNum);

      return res.status(200).json(
        response(200, "Data peminjaman berhasil diambil", {
          total_items: count,
          total_pages: totalPages,
          current_page: pageNum,
          limit: limitNum,
          data: rows,
        })
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json(
        response(500, "Terjadi kesalahan pada server", error.message)
      );
    }
  },

  // =========================
  // GET BY ID
  // =========================
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await BorrowingDetails.findOne({
        where: { id },
        include: [
          {
            model: Matsus,
            attributes: ["id", "name", "code", "foto"],
          },
        ],
      });

      if (!data) {
        return res.status(404).json(
          response(404, "Data peminjaman tidak ditemukan")
        );
      }

      return res.status(200).json(
        response(
          200,
          "Detail peminjaman berhasil diambil",
          data
        )
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json(
        response(500, "Terjadi kesalahan pada server", error.message)
      );
    }
  },

  // =========================
  // UPDATE (Perbarui Data + Penyesuaian Stok/Status)
  // =========================
  update: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        return_date,
        information_need,
        borrower_name,
        borrower_instansi,
        borrower_no_telp,
        borrower_address,
        borrower_category,
        id_matsus,
        total,
        status,
      } = req.body;

      const data = await BorrowingDetails.findOne({
        where: { id },
        transaction: t,
      });

      if (!data) {
        await t.rollback();
        return res.status(404).json(
          response(404, "Data peminjaman tidak ditemukan")
        );
      }

      const validStatus = [
        "Dipinjam",
        "Dikembalikan",
        "Terlambat",
        "Dibatalkan",
      ];

      if (status && !validStatus.includes(status)) {
        await t.rollback();
        return res.status(400).json(
          response(
            400,
            "Status hanya boleh Dipinjam, Dikembalikan, Terlambat, atau Dibatalkan"
          )
        );
      }

      const currentMatsus = await Matsus.findOne({
        where: { id: data.id_matsus },
        transaction: t,
      });

      const newStatus = status || data.status;
      const newTotal = total !== undefined ? Number(total) : data.total;

      // Logika Penyesuaian Stok saat Status/Jumlah Berubah:
      // 1. Jika status berubah jadi Dikembalikan / Dibatalkan -> kembalikan stok
      if (
        (data.status === "Dipinjam" || data.status === "Terlambat") &&
        (newStatus === "Dikembalikan" || newStatus === "Dibatalkan")
      ) {
        await currentMatsus.update(
          { available_item: currentMatsus.available_item + data.total },
          { transaction: t }
        );
      } 
      // 2. Jika dari Dikembalikan/Dibatalkan dipinjam lagi -> kurangi stok lagi
      else if (
        (data.status === "Dikembalikan" || data.status === "Dibatalkan") &&
        (newStatus === "Dipinjam" || newStatus === "Terlambat")
      ) {
        if (currentMatsus.available_item < newTotal) {
          await t.rollback();
          return res.status(400).json(
            response(400, `Stok tidak mencukupi. Stok tersedia: ${currentMatsus.available_item}`)
          );
        }
        await currentMatsus.update(
          { available_item: currentMatsus.available_item - newTotal },
          { transaction: t }
        );
      }
      // 3. Jika jumlah peminjaman diubah saat status masih Dipinjam/Terlambat
      else if (
        (newStatus === "Dipinjam" || newStatus === "Terlambat") &&
        newTotal !== data.total
      ) {
        const diff = newTotal - data.total;
        if (diff > 0 && currentMatsus.available_item < diff) {
          await t.rollback();
          return res.status(400).json(
            response(400, `Stok tambahan tidak mencukupi. Stok tersedia: ${currentMatsus.available_item}`)
          );
        }
        await currentMatsus.update(
          { available_item: currentMatsus.available_item - diff },
          { transaction: t }
        );
      }

      await data.update(
        {
          return_date: return_date !== undefined ? return_date : data.return_date,
          information_need: information_need !== undefined ? information_need : data.information_need,
          borrower_name: borrower_name !== undefined ? borrower_name : data.borrower_name,
          borrower_instansi: borrower_instansi !== undefined ? borrower_instansi : data.borrower_instansi,
          borrower_no_telp: borrower_no_telp !== undefined ? borrower_no_telp : data.borrower_no_telp,
          borrower_address: borrower_address !== undefined ? borrower_address : data.borrower_address,
          borrower_category: borrower_category !== undefined ? borrower_category : data.borrower_category,
          id_matsus: id_matsus !== undefined ? id_matsus : data.id_matsus,
          total: newTotal,
          status: newStatus,
        },
        { transaction: t }
      );

      await t.commit();

      const result = await BorrowingDetails.findOne({
        where: { id },
        include: [
          {
            model: Matsus,
            attributes: ["id", "name", "code", "foto"],
          },
        ],
      });

      return res.status(200).json(
        response(
          200,
          "Data peminjaman berhasil diperbarui",
          result
        )
      );
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json(
        response(500, "Terjadi kesalahan pada server", error.message)
      );
    }
  },

  delete: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;

      const data = await BorrowingDetails.findOne({
        where: { id },
        transaction: t,
      });

      if (!data) {
        await t.rollback();
        return res.status(404).json(
          response(404, "Data peminjaman tidak ditemukan")
        );
      }

      // Jika data yang dihapus statusnya masih Dipinjam/Terlambat, kembalikan stoknya
      if (data.status === "Dipinjam" || data.status === "Terlambat") {
        const matsus = await Matsus.findOne({
          where: { id: data.id_matsus },
          transaction: t,
        });

        if (matsus) {
          await matsus.update(
            { available_item: matsus.available_item + data.total },
            { transaction: t }
          );
        }
      }

      await data.destroy({ transaction: t });

      await t.commit();

      return res.status(200).json(
        response(200, "Data peminjaman berhasil dihapus")
      );
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json(
        response(500, "Terjadi kesalahan pada server", error.message)
      );
    }
  },
};