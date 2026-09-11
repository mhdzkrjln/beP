// const {
//   Inmails,
//   Outmails,
//   Matsus,
//   CategoryMatsus,
//   BorrowingDetails,
//   LogsActivity,
// } = require("../models");

// const { Op } = require("sequelize");
// const { response } = require("../helpers/response.formatter");

// module.exports = {
//   getReport: async (req, res) => {
//     try {
//       const { start_date, end_date, modul = "all" } = req.query;

//       // ==========================================
//       // DEFAULT PERIODE
//       // ==========================================

//       const now = new Date();

//       const startDate = start_date
//         ? new Date(`${start_date}T00:00:00`)
//         : new Date(now.getFullYear(), now.getMonth(), 1);

//       const endDate = end_date
//         ? new Date(`${end_date}T23:59:59.999`)
//         : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//       // ==========================================
//       // VALIDASI TANGGAL
//       // ==========================================

//       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         return res
//           .status(400)
//           .json(response(400, "Format tanggal tidak valid", null));
//       }

//       if (startDate > endDate) {
//         return res
//           .status(400)
//           .json(
//             response(
//               400,
//               "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
//               null,
//             ),
//           );
//       }

//       // ==========================================
//       // FILTER TANGGAL
//       // ==========================================

//       const dateFilter = {
//         createdAt: {
//           [Op.gte]: startDate,
//           [Op.lte]: endDate,
//         },
//       };

//       // ==========================================
//       // SUMMARY
//       // ==========================================

//       const [totalInmail, totalOutmail, totalMatsus, totalBorrowing] =
//         await Promise.all([
//           Inmails.count({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//           }),

//           Outmails.count({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//           }),

//           Matsus.count({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//           }),

//           BorrowingDetails.count({
//             where: {
//               ...dateFilter,
//             },
//           }),
//         ]);

//       // ==========================================
//       // STATUS PEMINJAMAN
//       // ==========================================

//       const borrowingStatus = {
//         dipinjam: await BorrowingDetails.count({
//           where: {
//             status: "Dipinjam",
//             ...dateFilter,
//           },
//         }),

//         terlambat: await BorrowingDetails.count({
//           where: {
//             status: "Terlambat",
//             ...dateFilter,
//           },
//         }),

//         dikembalikan: await BorrowingDetails.count({
//           where: {
//             status: "Dikembalikan",
//             ...dateFilter,
//           },
//         }),

//         dibatalkan: await BorrowingDetails.count({
//           where: {
//             status: "Dibatalkan",
//             ...dateFilter,
//           },
//         }),
//       };

//       // ==========================================
//       // AKTIVITAS PER HARI
//       // ==========================================

//       const activity = [];

//       const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

//       let currentDate = new Date(startDate);

//       while (currentDate <= endDate) {
//         const dayStart = new Date(
//           currentDate.getFullYear(),
//           currentDate.getMonth(),
//           currentDate.getDate(),
//         );

//         const dayEnd = new Date(
//           currentDate.getFullYear(),
//           currentDate.getMonth(),
//           currentDate.getDate() + 1,
//         );

//         const dailyFilter = {
//           createdAt: {
//             [Op.gte]: dayStart,
//             [Op.lt]: dayEnd,
//           },
//         };

//         const [inmail, outmail, matsus, borrowing] = await Promise.all([
//           Inmails.count({
//             where: {
//               deleted_at: null,
//               ...dailyFilter,
//             },
//           }),

//           Outmails.count({
//             where: {
//               deleted_at: null,
//               ...dailyFilter,
//             },
//           }),

//           Matsus.count({
//             where: {
//               deleted_at: null,
//               ...dailyFilter,
//             },
//           }),

//           BorrowingDetails.count({
//             where: {
//               ...dailyFilter,
//             },
//           }),
//         ]);

//         activity.push({
//           date: dayStart.toISOString().split("T")[0],

//           day: dayNames[dayStart.getDay()],

//           inmail,
//           outmail,
//           matsus,
//           borrowing,

//           total: inmail + outmail + matsus + borrowing,
//         });

//         currentDate.setDate(currentDate.getDate() + 1);
//       }

//       // ==========================================
//       // RINGKASAN MODUL
//       // ==========================================

//       const moduleTotal =
//         totalInmail + totalOutmail + totalBorrowing + totalMatsus;

//       const moduleSummary = [
//         {
//           module: "Surat Masuk",
//           total: totalInmail,
//           percentage:
//             moduleTotal > 0
//               ? Number(((totalInmail / moduleTotal) * 100).toFixed(1))
//               : 0,
//         },

//         {
//           module: "Surat Keluar",
//           total: totalOutmail,
//           percentage:
//             moduleTotal > 0
//               ? Number(((totalOutmail / moduleTotal) * 100).toFixed(1))
//               : 0,
//         },

//         {
//           module: "Peminjaman",
//           total: totalBorrowing,
//           percentage:
//             moduleTotal > 0
//               ? Number(((totalBorrowing / moduleTotal) * 100).toFixed(1))
//               : 0,
//         },

//         {
//           module: "Matsus",
//           total: totalMatsus,
//           percentage:
//             moduleTotal > 0
//               ? Number(((totalMatsus / moduleTotal) * 100).toFixed(1))
//               : 0,
//         },
//       ];

//       // ==========================================
//       // LAPORAN YANG TERSEDIA
//       // ==========================================

//       const reports = [
//         {
//           id: "inmail",
//           name: "Laporan Surat Masuk",
//           description: "Rekapitulasi surat masuk",
//           module: "Surat Masuk",
//           total: totalInmail,
//         },

//         {
//           id: "outmail",
//           name: "Laporan Surat Keluar",
//           description: "Rekapitulasi surat keluar",
//           module: "Surat Keluar",
//           total: totalOutmail,
//         },

//         {
//           id: "borrowing",
//           name: "Laporan Peminjaman",
//           description: "Rekapitulasi transaksi peminjaman",
//           module: "Peminjaman",
//           total: totalBorrowing,
//         },

//         {
//           id: "matsus",
//           name: "Laporan Matsus",
//           description: "Rekapitulasi data material khusus",
//           module: "Matsus",
//           total: totalMatsus,
//         },
//       ];

//       // ==========================================
//       // DATA DETAIL
//       // ==========================================

//       let data = null;

//       // ------------------------------------------
//       // SEMUA DATA
//       // ------------------------------------------

//       if (modul === "all") {
//         data = {
//           inmails: await Inmails.findAll({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//             order: [["createdAt", "DESC"]],
//           }),

//           outmails: await Outmails.findAll({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//             order: [["createdAt", "DESC"]],
//           }),

//           matsus: await Matsus.findAll({
//             where: {
//               deleted_at: null,
//               ...dateFilter,
//             },
//             include: [
//               {
//                 model: CategoryMatsus,
//                 required: false,
//               },
//             ],
//             order: [["createdAt", "DESC"]],
//           }),

//           borrowing: await BorrowingDetails.findAll({
//             where: {
//               ...dateFilter,
//             },
//             order: [["createdAt", "DESC"]],
//           }),
//         };
//       }

//       // ------------------------------------------
//       // SURAT MASUK
//       // ------------------------------------------
//       else if (modul === "inmail") {
//         data = await Inmails.findAll({
//           where: {
//             deleted_at: null,
//             ...dateFilter,
//           },
//           order: [["createdAt", "DESC"]],
//         });
//       }

//       // ------------------------------------------
//       // SURAT KELUAR
//       // ------------------------------------------
//       else if (modul === "outmail") {
//         data = await Outmails.findAll({
//           where: {
//             deleted_at: null,
//             ...dateFilter,
//           },
//           order: [["createdAt", "DESC"]],
//         });
//       }

//       // ------------------------------------------
//       // MATSUS
//       // ------------------------------------------
//       else if (modul === "matsus") {
//         data = await Matsus.findAll({
//           where: {
//             deleted_at: null,
//             ...dateFilter,
//           },
//           include: [
//             {
//               model: CategoryMatsus,
//               required: false,
//             },
//           ],
//           order: [["createdAt", "DESC"]],
//         });
//       }

//       // ------------------------------------------
//       // PEMINJAMAN
//       // ------------------------------------------
//       else if (modul === "borrowing") {
//         data = await BorrowingDetails.findAll({
//           where: {
//             ...dateFilter,
//           },
//           order: [["createdAt", "DESC"]],
//         });
//       }

//       // ==========================================
//       // MODUL TIDAK VALID
//       // ==========================================
//       else {
//         return res.status(400).json(
//           response(400, "Modul laporan tidak valid", {
//             available_modules: [
//               "all",
//               "inmail",
//               "outmail",
//               "matsus",
//               "borrowing",
//             ],
//           }),
//         );
//       }

//       // ==========================================
//       // RESPONSE
//       // ==========================================

//       const reportData = {
//         period: {
//           start_date: startDate.toISOString().split("T")[0],

//           end_date: endDate.toISOString().split("T")[0],
//         },

//         filter: {
//           modul,
//         },

//         summary: {
//           inmail: totalInmail,
//           outmail: totalOutmail,
//           matsus: totalMatsus,
//           borrowing: totalBorrowing,

//           total_activity:
//             totalInmail + totalOutmail + totalMatsus + totalBorrowing,
//         },

//         borrowing_status: borrowingStatus,

//         activity,

//         module_summary: moduleSummary,

//         reports,

//         data,
//       };

//       return res
//         .status(200)
//         .json(response(200, "Laporan berhasil diambil", reportData));
//     } catch (error) {
//       console.error("Report Error:", error);

//       return res
//         .status(500)
//         .json(response(500, "Gagal mengambil laporan", error.message));
//     }
//   },
// };

const {
  Inmails,
  Outmails,
  Matsus,
  CategoryMatsus,
  BorrowingDetails,
  LogsActivity,
} = require("../models");

const { Op } = require("sequelize");
const { response } = require("../helpers/response.formatter");

// Helper untuk format YYYY-MM-DD menggunakan waktu lokal
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

module.exports = {
  getReport: async (req, res) => {
    try {
      const { start_date, end_date, modul = "all" } = req.query;

      // ==========================================
      // DEFAULT PERIODE & ZONA WAKTU LOKAL
      // ==========================================

      const now = new Date();

      // Gunakan penanganan string lokal agar jam dipatok tepat di awal hari (00:00:00)
      let startDate;
      if (start_date) {
        const [y, m, d] = start_date.split("-").map(Number);
        startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }

      // Dipatok tepat di akhir hari (23:59:59.999) waktu lokal
      let endDate;
      if (end_date) {
        const [y, m, d] = end_date.split("-").map(Number);
        endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // ==========================================
      // VALIDASI TANGGAL
      // ==========================================

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res
          .status(400)
          .json(response(400, "Format tanggal tidak valid", null));
      }

      if (startDate > endDate) {
        return res
          .status(400)
          .json(
            response(
              400,
              "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
              null,
            ),
          );
      }

      // ==========================================
      // FILTER TANGGAL
      // ==========================================

      const dateFilter = {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      };

      // ==========================================
      // SUMMARY
      // ==========================================

      const [totalInmail, totalOutmail, totalMatsus, totalBorrowing] =
        await Promise.all([
          Inmails.count({
            where: {
              deleted_at: null,
              ...dateFilter,
            },
          }),

          Outmails.count({
            where: {
              deleted_at: null,
              ...dateFilter,
            },
          }),

          Matsus.count({
            where: {
              deleted_at: null,
              ...dateFilter,
            },
          }),

          BorrowingDetails.count({
            where: {
              ...dateFilter,
            },
          }),
        ]);

      // ==========================================
      // STATUS PEMINJAMAN
      // ==========================================

      const [dipinjam, terlambat, dikembalikan, dibatalkan] = await Promise.all([
        BorrowingDetails.count({
          where: { status: "Dipinjam", ...dateFilter },
        }),
        BorrowingDetails.count({
          where: { status: "Terlambat", ...dateFilter },
        }),
        BorrowingDetails.count({
          where: { status: "Dikembalikan", ...dateFilter },
        }),
        BorrowingDetails.count({
          where: { status: "Dibatalkan", ...dateFilter },
        }),
      ]);

      const borrowingStatus = { dipinjam, terlambat, dikembalikan, dibatalkan };

      // ==========================================
      // AKTIVITAS PER HARI
      // ==========================================

      const activity = [];
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          0, 0, 0, 0
        );

        const dayEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          23, 59, 59, 999
        );

        const dailyFilter = {
          createdAt: {
            [Op.gte]: dayStart,
            [Op.lte]: dayEnd,
          },
        };

        const [inmail, outmail, matsus, borrowing] = await Promise.all([
          Inmails.count({
            where: {
              deleted_at: null,
              ...dailyFilter,
            },
          }),

          Outmails.count({
            where: {
              deleted_at: null,
              ...dailyFilter,
            },
          }),

          Matsus.count({
            where: {
              deleted_at: null,
              ...dailyFilter,
            },
          }),

          BorrowingDetails.count({
            where: {
              ...dailyFilter,
            },
          }),
        ]);

        activity.push({
          date: formatLocalDate(dayStart), // Menggunakan helper agar tidak kepotong UTC
          day: dayNames[dayStart.getDay()],
          inmail,
          outmail,
          matsus,
          borrowing,
          total: inmail + outmail + matsus + borrowing,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // ==========================================
      // RINGKASAN MODUL
      // ==========================================

      const moduleTotal =
        totalInmail + totalOutmail + totalBorrowing + totalMatsus;

      const moduleSummary = [
        {
          module: "Surat Masuk",
          total: totalInmail,
          percentage:
            moduleTotal > 0
              ? Number(((totalInmail / moduleTotal) * 100).toFixed(1))
              : 0,
        },
        {
          module: "Surat Keluar",
          total: totalOutmail,
          percentage:
            moduleTotal > 0
              ? Number(((totalOutmail / moduleTotal) * 100).toFixed(1))
              : 0,
        },
        {
          module: "Peminjaman",
          total: totalBorrowing,
          percentage:
            moduleTotal > 0
              ? Number(((totalBorrowing / moduleTotal) * 100).toFixed(1))
              : 0,
        },
        {
          module: "Matsus",
          total: totalMatsus,
          percentage:
            moduleTotal > 0
              ? Number(((totalMatsus / moduleTotal) * 100).toFixed(1))
              : 0,
        },
      ];

      // ==========================================
      // LAPORAN YANG TERSEDIA
      // ==========================================

      const reports = [
        {
          id: "inmail",
          name: "Laporan Surat Masuk",
          description: "Rekapitulasi surat masuk",
          module: "Surat Masuk",
          total: totalInmail,
        },
        {
          id: "outmail",
          name: "Laporan Surat Keluar",
          description: "Rekapitulasi surat keluar",
          module: "Surat Keluar",
          total: totalOutmail,
        },
        {
          id: "borrowing",
          name: "Laporan Peminjaman",
          description: "Rekapitulasi transaksi peminjaman",
          module: "Peminjaman",
          total: totalBorrowing,
        },
        {
          id: "matsus",
          name: "Laporan Matsus",
          description: "Rekapitulasi data material khusus",
          module: "Matsus",
          total: totalMatsus,
        },
      ];

      // ==========================================
      // DATA DETAIL
      // ==========================================

      let data = null;

    //   if (modul === "all") {
    //     data = {
    //       inmails: await Inmails.findAll({
    //         where: { deleted_at: null, ...dateFilter },
    //         order: [["createdAt", "DESC"]],
    //       }),

    //       outmails: await Outmails.findAll({
    //         where: { deleted_at: null, ...dateFilter },
    //         order: [["createdAt", "DESC"]],
    //       }),

    //       matsus: await Matsus.findAll({
    //         where: { deleted_at: null, ...dateFilter },
    //         include: [
    //           {
    //             model: CategoryMatsus,
    //             required: false,
    //           },
    //         ],
    //         order: [["createdAt", "DESC"]],
    //       }),

    //       borrowing: await BorrowingDetails.findAll({
    //         where: { ...dateFilter },
    //         order: [["createdAt", "DESC"]],
    //       }),
    //     };
    //   } else if (modul === "inmail") {
    //     data = await Inmails.findAll({
    //       where: { deleted_at: null, ...dateFilter },
    //       order: [["createdAt", "DESC"]],
    //     });
    //   } else if (modul === "outmail") {
    //     data = await Outmails.findAll({
    //       where: { deleted_at: null, ...dateFilter },
    //       order: [["createdAt", "DESC"]],
    //     });
    //   } else if (modul === "matsus") {
    //     data = await Matsus.findAll({
    //       where: { deleted_at: null, ...dateFilter },
    //       include: [
    //         {
    //           model: CategoryMatsus,
    //           required: false,
    //         },
    //       ],
    //       order: [["createdAt", "DESC"]],
    //     });
    //   } else if (modul === "borrowing") {
    //     data = await BorrowingDetails.findAll({
    //       where: { ...dateFilter },
    //       order: [["createdAt", "DESC"]],
    //     });
    //   } else {
    //     return res.status(400).json(
    //       response(400, "Modul laporan tidak valid", {
    //         available_modules: [
    //           "all",
    //           "inmail",
    //           "outmail",
    //           "matsus",
    //           "borrowing",
    //         ],
    //       }),
    //     );
    //   }

      // ==========================================
      // RESPONSE
      // ==========================================

      const reportData = {
        period: {
          start_date: formatLocalDate(startDate),
          end_date: formatLocalDate(endDate),
        },

        // filter: {
        //   modul,
        // },

        summary: {
          inmail: totalInmail,
          outmail: totalOutmail,
          matsus: totalMatsus,
          borrowing: totalBorrowing,
          total_activity: moduleTotal,
        },

        borrowing_status: borrowingStatus,

        activity,

        module_summary: moduleSummary,

        reports,

        data,
      };

      return res
        .status(200)
        .json(response(200, "Laporan berhasil diambil", reportData));
    } catch (error) {
      console.error("Report Error:", error);

      return res
        .status(500)
        .json(response(500, "Gagal mengambil laporan", error.message));
    }
  },
};