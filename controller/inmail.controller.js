const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { Inmails } = require("../models");
const { response } = require("../helpers/response.formatter");

const deleteFile = (filename) => {
  if (!filename) return;
  const fileName = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  } else {
  }
};

module.exports = {
  create: async (req, res) => {
    try {
      const {
        no_mail,
        date_mail,
        date_received,
        sender,
        about,
        information,
        classification,
      } = req.body;

      const file = req.file?.filename || null;

      if (
        !no_mail ||
        !date_mail ||
        !date_received ||
        !sender ||
        !about ||
        !classification ||
        !file
      ) {
        deleteFile(file);
        return res
          .status(400)
          .json(
            response(
              400,
              "Nomor surat, tanggal surat, tanggal diterima, pengirim, perihal, klasifikasi, dan file wajib diisi",
            ),
          );
      }

      const existingMail = await Inmails.findOne({
        where: { no_mail: no_mail.trim() },
      });

      if (existingMail) {
        return res.status(400).json(response(400, "Kode surat sudah tersedia"));
      }

      if (
        classification &&
        !["Internal", "External"].includes(classification)
      ) {
        deleteFile(file);
        return res
          .status(400)
          .json(
            response(400, "Classification hanya boleh Internal atau External"),
          );
      }

      const data = await Inmails.create({
        no_mail,
        date_mail,
        date_received,
        sender,
        about,
        information: information || null,
        classification,
        file,
        is_arsip: false,
        deleted_at: null,
      });

      return res
        .status(201)
        .json(response(201, "Surat masuk berhasil dibuat", data));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server", error.message));
    }
  },

  getAll: async (req, res) => {
    try {
      const {
        search = "",
        sort = "date_received",
        order = "ASC",
        page = 1,
        limit = 10,
        status = "active",
      } = req.query;

      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const limitNumber = Math.max(parseInt(limit) || 10, 1);
      const offset = (pageNumber - 1) * limitNumber;

      const allowedSort = [
        "no_mail",
        "date_mail",
        "date_received",
        "sender",
        "classification",
        "createdAt",
      ];

      const sortField = allowedSort.includes(sort) ? sort : "date_received";
      const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const where = {};

      if (status === "active") {
        where.deleted_at = null;
        where.is_arsip = false;
      }

      if (status === "archive") {
        where.deleted_at = null;
        where.is_arsip = true;
      }

      if (status === "deleted") {
        where.deleted_at = {
          [Op.not]: null,
        };

        where.is_arsip = false;
      }

      if (search.trim() !== "") {
        where[Op.or] = [
          {
            no_mail: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            sender: {
              [Op.like]: `%${search}%`,
            },
          },
        ];
      }

      const { count, rows } = await Inmails.findAndCountAll({
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
          total_page: totalPages,
        },
      };

      return res
        .status(200)
        .json(response(200, "Data surat masuk berhasil diambil", data));
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Inmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

      return res
        .status(200)
        .json(response(200, "Data surat masuk berhasil diambil", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        no_mail,
        date_mail,
        date_received,
        sender,
        about,
        information,
        classification,
        is_arsip,
      } = req.body;

      const data = await Inmails.findOne({
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
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

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

      if (no_mail && no_mail.trim() !== data.no_mail) {
        const existingMail = await Inmails.findOne({
          where: {
            no_mail: no_mail.trim(),
            deleted_at: null,
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
      }

      const oldFile = data.file;
      const newFile = req.file ? req.file.filename : oldFile;

      await data.update({
        no_mail: no_mail ?? data.no_mail,
        date_mail: date_mail ?? data.date_mail,
        date_received: date_received ?? data.date_received,
        sender: sender ?? data.sender,
        about: about ?? data.about,
        information: information ?? data.information,
        classification: classification ?? data.classification,
        is_arsip: is_arsip ?? data.is_arsip,
        file: newFile,
      });

      if (req.file && oldFile && oldFile !== newFile) {
        deleteFile(oldFile);
      }

      return res
        .status(200)
        .json(response(200, "Surat masuk berhasil diperbarui", data));
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

      const data = await Inmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

      await data.update({
        deleted_at: new Date(),
      });

      return res
        .status(200)
        .json(response(200, "Surat masuk berhasil dihapus"));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  restore: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Inmails.findOne({
        where: {
          id,
          deleted_at: {
            [Op.not]: null,
          },
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

      await data.update({
        deleted_at: null,
      });

      return res
        .status(200)
        .json(response(200, "Surat masuk berhasil dipulihkan", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  archive: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Inmails.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

      await data.update({
        is_arsip: true,
      });

      return res
        .status(200)
        .json(response(200, "Surat masuk berhasil diarsipkan", data));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },

  unarchive: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Inmails.findOne({
        where: {
          id,
          deleted_at: null,
          is_arsip: true,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Surat masuk tidak ditemukan"));
      }

      await data.update({
        is_arsip: false,
      });

      return res
        .status(200)
        .json(
          response(200, "Surat masuk berhasil dikeluarkan dari arsip", data),
        );
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Terjadi kesalahan pada server"));
    }
  },
};