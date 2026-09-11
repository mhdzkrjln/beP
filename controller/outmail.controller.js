const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { Outmails } = require("../models");
const { response } = require("../helpers/response.formatter");

const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  create: async (req, res) => {
    try {
      const {
        no_mail,
        date_mail,
        date_sent,
        destination,
        about,
        information,
        tembusan,
        classification,
      } = req.body;

      const file = req.file ? req.file.filename : null;

      // Validasi data wajib
      if (
        !no_mail ||
        !date_mail ||
        !date_sent ||
        !destination ||
        !about ||
        !information ||
        !tembusan ||
        !file ||
        !classification
      ) {
        if (file) {
          deleteFile(file);
        }

        return res
          .status(400)
          .json(
            response(
              400,
              "Nomor surat, tanggal surat, tanggal dikirim, tujuan surat, perihal surat, informasi surat, penerima surat, dan file surat wajib diisi",
            ),
          );
      }

      // Validasi classification
      if (
        classification &&
        !["Internal", "External"].includes(classification)
      ) {
        if (file) {
          deleteFile(file);
        }

        return res
          .status(400)
          .json(
            response(400, "Classification hanya boleh Internal atau External"),
          );
      }

      // Cek nomor surat
      const existingMail = await Outmails.findOne({
        where: {
          no_mail: no_mail.trim(),
          deleted_at: null,
        },
      });

      if (existingMail) {
        if (file) {
          deleteFile(file);
        }

        return res
          .status(400)
          .json(response(400, "Nomor surat sudah tersedia"));
      }

      // Simpan data
      const data = await Outmails.create({
        no_mail: no_mail.trim(),
        date_mail,
        date_sent,
        destination,
        about,
        information,
        tembusan,
        classification,
        file,
        is_arsip: false,
        deleted_at: null,
      });

      return res
        .status(201)
        .json(response(201, "Surat keluar berhasil dibuat", data));
    } catch (error) {
      // Hapus file jika proses database gagal
      if (req.file) {
        deleteFile(req.file.filename);
      }

      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server", error.message));
    }
  },

  getAll: async (req, res) => {
    try {
      const {
        search = "",
        sort = "createdAt",
        order = "DESC",
        page = 1,
        limit = 5,
        status = "active",
      } = req.query;

      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const limitNumber = Math.max(parseInt(limit) || 5, 1);
      const offset = (pageNumber - 1) * limitNumber;

      const allowedSort = [
        "no_mail",
        "date_mail",
        "date_sent",
        "classification",
        "createdAt",
      ];

      const sortField = allowedSort.includes(sort) ? sort : "createdAt";

      const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const where = {};

      // Surat aktif
      if (status === "active") {
        where.deleted_at = null;
        where.is_arsip = false;
      }

      // Surat arsip
      if (status === "archive") {
        where.deleted_at = null;
        where.is_arsip = true;
      }

      // Surat terhapus
      if (status === "deleted") {
        where.deleted_at = {
          [Op.not]: null,
        };

        where.is_arsip = false;
      }

      // Search
      if (search.trim() !== "") {
        where[Op.or] = [
          {
            no_mail: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            destination: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            tembusan: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            about: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      const { count, rows } = await Outmails.findAndCountAll({
        where,
        order: [[sortField, sortOrder]],
        limit: limitNumber,
        offset,
      });

      const totalPages = Math.ceil(count / limitNumber);

      const data = {
        data: rows,
        pagination: {
          total_data: count,
          current_page: pageNumber,
          per_page: limitNumber,
          total_pages: totalPages,
        },
      };

      return res
        .status(200)
        .json(response(200, "Data surat keluar berhasil diambil", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server", error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Data surat keluar tidak ditemukan"));
      }

      return res
        .status(200)
        .json(response(200, "Data surat keluar berhasil diambil", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server", error.message));
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        no_mail,
        date_mail,
        date_sent,
        destination,
        about,
        information,
        tembusan,
        classification,
        is_arsip,
      } = req.body;

      // 1. Cari data lama
      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res
          .status(404)
          .json(response(404, "Surat keluar tidak ditemukan"));
      }

      // 2. Deklarasikan file baru / file lama di awal
      const oldFile = data.file;
      const newFile = req.file ? req.file.filename : oldFile;

      // 3. Validasi Field Wajib (Tanpa memaksa req.file harus selalu ada saat UPDATE)
      if (
        !no_mail ||
        !date_mail ||
        !date_sent ||
        !destination ||
        !about ||
        !information ||
        !tembusan ||
        !classification ||
        !newFile // Memastikan minimal ada file lama ATAU file baru
      ) {
        if (req.file) {
          deleteFile(req.file.filename); // Gunakan req.file.filename
        }

        return res
          .status(400)
          .json(
            response(
              400,
              "Nomor surat, tanggal surat, tanggal dikirim, tujuan surat, perihal surat, informasi surat, penerima surat, dan file surat wajib diisi",
            ),
          );
      }

      // 4. Validasi classification
      if (
        classification &&
        !["Internal", "External"].includes(classification)
      ) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res
          .status(400)
          .json(
            response(400, "Classification hanya boleh Internal atau External"),
          );
      }

      // 5. Cek nomor surat unik
      const existingMail = await Outmails.findOne({
        where: {
          no_mail: no_mail.trim(),
          deleted_at: null,
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (existingMail) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res
          .status(400)
          .json(response(400, "Nomor surat sudah tersedia"));
      }

      await data.update({
        no_mail: no_mail !== undefined ? no_mail.trim() : data.no_mail,
        date_mail: date_mail ?? data.date_mail,
        date_sent: date_sent ?? data.date_sent,
        destination: destination ?? data.destination,
        about: about ?? data.about,
        information: information ?? data.information,
        tembusan: tembusan ?? data.tembusan,
        classification: classification ?? data.classification,
        is_arsip: is_arsip ?? data.is_arsip,
        file: newFile,
      });

      if (req.file && oldFile && oldFile !== newFile) {
        deleteFile(oldFile);
      }

      return res
        .status(200)
        .json(response(200, "Surat keluar berhasil diperbarui", data));
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.filename);
      }

      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server", error.message));
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat keluar tidak ditemukan"));
      }

      await data.update({
        deleted_at: new Date(),
      });

      return res
        .status(200)
        .json(response(200, "Surat keluar berhasil dihapus"));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  restore: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: {
            [Op.ne]: null,
          },
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat keluar tidak ditemukan"));
      }

      await data.update({
        deleted_at: null,
      });

      return res
        .status(200)
        .json(response(200, "Surat keluar berhasil dipulihkan", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  archive: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat keluar tidak ditemukan"));
      }

      await data.update({
        is_arsip: true,
      });

      return res
        .status(200)
        .json(response(200, "Surat keluar berhasil diarsipkan", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  unarchive: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Outmails.findOne({
        where: {
          id,
          deleted_at: null,
          is_arsip: true,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat keluar tidak ditemukan"));
      }

      await data.update({
        is_arsip: false,
      });

      return res
        .status(200)
        .json(
          response(200, "Surat keluar berhasil dikeluarkan dari arsip", data),
        );
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },
};
