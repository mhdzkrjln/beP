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
      const now = new Date();
      let startDate;
      if (start_date) {
        const [y, m, d] = start_date.split("-").map(Number);
        startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }

      let endDate;
      if (end_date) {
        const [y, m, d] = end_date.split("-").map(Number);
        endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

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

      const dateFilter = {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      };

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
          date: formatLocalDate(dayStart),
          day: dayNames[dayStart.getDay()],
          inmail,
          outmail,
          matsus,
          borrowing,
          total: inmail + outmail + matsus + borrowing,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

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

      let data = null;

      const reportData = {
        period: {
          start_date: formatLocalDate(startDate),
          end_date: formatLocalDate(endDate),
        },

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