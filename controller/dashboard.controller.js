const {
  Inmails,
  Outmails,
  Matsus,
  BorrowingDetails,
  LogsActivity,
} = require("../models");

const { Op } = require("sequelize");
const { response } = require("../helpers/response.formatter");

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const totalInmail = await Inmails.count({
        where: {
          deleted_at: null,
        },
      });

      const newInmailThisMonth = await Inmails.count({
        where: {
          deleted_at: null,
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth,
          },
        },
      });

      const totalOutmail = await Outmails.count({
        where: {
          deleted_at: null,
        },
      });

      const newOutmailThisMonth = await Outmails.count({
        where: {
          deleted_at: null,
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth,
          },
        },
      });

      const totalMatsus = await Matsus.count({
        where: {
          deleted_at: null,
        },
      });

      const totalAvailableItem = await Matsus.sum("available_item", {
        where: {
          deleted_at: null,
        },
      });

      const totalItem = await Matsus.sum("total_item", {
        where: {
          deleted_at: null,
        },
      });

      const newMatsusThisMonth = await Matsus.count({
        where: {
          deleted_at: null,
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth,
          },
        },
      });

      const totalBorrowing = await BorrowingDetails.count();

      const activeBorrowing = await BorrowingDetails.count({
        where: {
          status: "Dipinjam",
        },
      });

      const lateBorrowing = await BorrowingDetails.count({
        where: {
          status: "Terlambat",
        },
      });

      const returnedBorrowing = await BorrowingDetails.count({
        where: {
          status: "Dikembalikan",
        },
      });

      const cancelledBorrowing = await BorrowingDetails.count({
        where: {
          status: "Dibatalkan",
        },
      });

      const chart = [];

      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);

        date.setDate(now.getDate() - i);

        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );

        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1,
        );

        const inmail = await Inmails.count({
          where: {
            deleted_at: null,
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lt]: endOfDay,
            },
          },
        });

        const outmail = await Outmails.count({
          where: {
            deleted_at: null,
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lt]: endOfDay,       
            },
          },
        });

        const matsus = await Matsus.count({
          where: {
            deleted_at: null,
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lt]: endOfDay,
            },
          },
        });

        const borrowing = await BorrowingDetails.count({
          where: {
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lt]: endOfDay,
            },
          },
        });

        chart.push({
          name: dayNames[startOfDay.getDay()],
          date: startOfDay.toISOString().split("T")[0],
          inmail,
          outmail,
          matsus,
          borrowing,
        });
      }

      const borrowingStatus = {
        dipinjam: activeBorrowing,
        terlambat: lateBorrowing,
        dikembalikan: returnedBorrowing,
        dibatalkan: cancelledBorrowing,
      };

      const recentActivity = await LogsActivity.findAll({
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const dashboardData = {
        summary: {
          inmail: {
            total: totalInmail,
            new_this_month: newInmailThisMonth,
          },

          outmail: {
            total: totalOutmail,
            new_this_month: newOutmailThisMonth,
          },

          matsus: {
            total: totalMatsus,
            total_item: totalItem || 0,
            available_item: totalAvailableItem || 0,
            new_this_month: newMatsusThisMonth,
          },

          borrowing: {
            total: totalBorrowing,
            active: activeBorrowing,
            late: lateBorrowing,
            returned: returnedBorrowing,
            cancelled: cancelledBorrowing,
          },
        },

        chart,

        borrowing_status: borrowingStatus,

        recent_activity: recentActivity,
      };

      return res
        .status(200)
        .json(response(200, "Dashboard berhasil diambil", dashboardData));
    } catch (error) {
      console.error("Dashboard Error:", error);

      return res
        .status(500)
        .json(response(500, "Gagal mengambil data dashboard", error.message));
    }
  },
};
