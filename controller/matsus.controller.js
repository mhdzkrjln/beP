const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { Matsus, CategoryMatsus } = require("../models");
const { response } = require("../helpers/response.formatter");

const deleteFile = (filename) => {
  if (!filename) return;

  const fileName = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  create: async (req, res) => {
    try {
      const {
        name,
        code,
        id_category,
        total_item,
        available_item,
        location,
        condition,
        information,
      } = req.body;

      const foto = req.file ? req.file.filename : null;

      if (
        !name ||
        !code ||
        !id_category ||
        total_item === undefined ||
        available_item === undefined ||
        !location ||
        !condition
      ) {
        if (foto) {
          deleteFile(foto);
        }

        return res.status(400).json(
          response(
            400,
            "Nama, kode, kategori, total item, item tersedia, lokasi, dan kondisi wajib diisi",
          ),
        );
      }

      const category = await CategoryMatsus.findOne({
        where: {
          id: id_category,
        },
      });

      if (!category) {
        if (foto) {
          deleteFile(foto);
        }

        return res
          .status(404)
          .json(response(404, "Category matsus tidak ditemukan"));
      }

      if (!["Baik", "Rusak", "Hilang"].includes(condition)) {
        if (foto) {
          deleteFile(foto);
        }

        return res.status(400).json(
          response(
            400,
            "Condition hanya boleh Baik, Rusak, atau Hilang",
          ),
        );
      }

      const totalItemNumber = Number(total_item);
      const availableItemNumber = Number(available_item);

      if (!Number.isInteger(totalItemNumber) || totalItemNumber < 0) {
        if (foto) {
          deleteFile(foto);
        }

        return res.status(400).json(
          response(
            400,
            "Total item harus berupa angka bulat dan tidak boleh kurang dari 0",
          ),
        );
      }

      if (
        !Number.isInteger(availableItemNumber) ||
        availableItemNumber < 0
      ) {
        if (foto) {
          deleteFile(foto);
        }

        return res.status(400).json(
          response(
            400,
            "Available item harus berupa angka bulat dan tidak boleh kurang dari 0",
          ),
        );
      }

      if (availableItemNumber > totalItemNumber) {
        if (foto) {
          deleteFile(foto);
        }

        return res.status(400).json(
          response(
            400,
            "Available item tidak boleh lebih banyak dari total item",
          ),
        );
      }

      const existingCode = await Matsus.findOne({
        where: {
          code: code.trim(),
          deleted_at: null,
        },
      });

      if (existingCode) {
        if (foto) {
          deleteFile(foto);
        }

        return res
          .status(400)
          .json(response(400, "Kode matsus sudah tersedia"));
      }

      const data = await Matsus.create({
        name: name.trim(),
        code: code.trim(),
        id_category,
        total_item: totalItemNumber,
        available_item: availableItemNumber,
        location: location.trim(),
        condition,
        foto,
        information: information || null,
        deleted_at: null,
      });

      return res.status(201).json(
        response(201, "Data matsus berhasil dibuat", data),
      );
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.filename);
      }

      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
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
        condition,
        id_category,
      } = req.query;

      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const limitNumber = Math.max(parseInt(limit) || 5, 1);
      const offset = (pageNumber - 1) * limitNumber;

      const allowedSort = [
        "name",
        "code",
        "id_category",
        "total_item",
        "available_item",
        "location",
        "condition",
        "createdAt",
      ];

      const sortField = allowedSort.includes(sort)
        ? sort
        : "createdAt";

      const sortOrder =
        order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const where = {};

      if (status === "active") {
        where.deleted_at = null;
      }

      if (status === "deleted") {
        where.deleted_at = {
          [Op.not]: null,
        };
      }

      if (condition) {
        if (!["Baik", "Rusak", "Hilang"].includes(condition)) {
          return res.status(400).json(
            response(
              400,
              "Condition hanya boleh Baik, Rusak, atau Hilang",
            ),
          );
        }

        where.condition = condition;
      }

      if (id_category) {
        where.id_category = id_category;
      }

      if (search.trim() !== "") {
        where[Op.or] = [
          {
            name: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            code: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            location: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            information: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      const { count, rows } = await Matsus.findAndCountAll({
        where,

        include: [
          {
            model: CategoryMatsus,
            attributes: ["id", "name", "information"],
          },
        ],

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

      return res.status(200).json(
        response(
          200,
          "Data matsus berhasil diambil",
          data,
        ),
      );
    } catch (error) {
      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Matsus.findOne({
        where: {
          id,
          deleted_at: null,
        },

        include: [
          {
            model: CategoryMatsus,
            attributes: ["id", "name", "information"],
          },
        ],
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Data matsus tidak ditemukan"));
      }

      return res.status(200).json(
        response(
          200,
          "Data matsus berhasil diambil",
          data,
        ),
      );
    } catch (error) {
      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        code,
        id_category,
        total_item,
        available_item,
        location,
        condition,
        information,
      } = req.body;

      const data = await Matsus.findOne({
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
          .json(response(404, "Data matsus tidak ditemukan"));
      }

      const oldFoto = data.foto;
      const newFoto = req.file
        ? req.file.filename
        : oldFoto;

      if (name !== undefined && !name.trim()) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res
          .status(400)
          .json(response(400, "Nama matsus tidak boleh kosong"));
      }

      if (id_category !== undefined) {
        const category = await CategoryMatsus.findOne({
          where: {
            id: id_category,
          },
        });

        if (!category) {
          if (req.file) {
            deleteFile(req.file.filename);
          }

          return res
            .status(404)
            .json(response(404, "Category matsus tidak ditemukan"));
        }
      }

      if (
        condition !== undefined &&
        !["Baik", "Rusak", "Hilang"].includes(condition)
      ) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res.status(400).json(
          response(
            400,
            "Condition hanya boleh Baik, Rusak, atau Hilang",
          ),
        );
      }

      const newTotalItem =
        total_item !== undefined
          ? Number(total_item)
          : Number(data.total_item);

      const newAvailableItem =
        available_item !== undefined
          ? Number(available_item)
          : Number(data.available_item);

      if (
        !Number.isInteger(newTotalItem) ||
        newTotalItem < 0
      ) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res.status(400).json(
          response(
            400,
            "Total item harus berupa angka bulat dan tidak boleh kurang dari 0",
          ),
        );
      }

      if (
        !Number.isInteger(newAvailableItem) ||
        newAvailableItem < 0
      ) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res.status(400).json(
          response(
            400,
            "Available item harus berupa angka bulat dan tidak boleh kurang dari 0",
          ),
        );
      }

      if (newAvailableItem > newTotalItem) {
        if (req.file) {
          deleteFile(req.file.filename);
        }

        return res.status(400).json(
          response(
            400,
            "Available item tidak boleh lebih banyak dari total item",
          ),
        );
      }

      if (code !== undefined && code.trim() !== data.code) {
        const existingCode = await Matsus.findOne({
          where: {
            code: code.trim(),
            deleted_at: null,

            id: {
              [Op.ne]: id,
            },
          },
        });

        if (existingCode) {
          if (req.file) {
            deleteFile(req.file.filename);
          }

          return res
            .status(400)
            .json(response(400, "Kode matsus sudah tersedia"));
        }
      }

      await data.update({
        name:
          name !== undefined
            ? name.trim()
            : data.name,

        code:
          code !== undefined
            ? code.trim()
            : data.code,

        id_category:
          id_category !== undefined
            ? id_category
            : data.id_category,

        total_item: newTotalItem,

        available_item: newAvailableItem,

        location:
          location !== undefined
            ? location.trim()
            : data.location,

        condition:
          condition !== undefined
            ? condition
            : data.condition,

        information:
          information !== undefined
            ? information
            : data.information,

        foto: newFoto,
      });

      if (
        req.file &&
        oldFoto &&
        oldFoto !== newFoto
      ) {
        deleteFile(oldFoto);
      }

      return res.status(200).json(
        response(
          200,
          "Data matsus berhasil diperbarui",
          data,
        ),
      );
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.filename);
      }

      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Matsus.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!data) {
        return res
          .status(404)
          .json(response(404, "Data matsus tidak ditemukan"));
      }

      await data.update({
        deleted_at: new Date(),
      });

      return res.status(200).json(
        response(
          200,
          "Data matsus berhasil dihapus",
        ),
      );
    } catch (error) {
      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
    }
  },

  restore: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Matsus.findOne({
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
          .json(response(404, "Data matsus tidak ditemukan"));
      }

      await data.update({
        deleted_at: null,
      });

      return res.status(200).json(
        response(
          200,
          "Data matsus berhasil dipulihkan",
          data,
        ),
      );
    } catch (error) {
      return res.status(500).json(
        response(
          500,
          "Terjadi kesalahan pada server",
          error.message,
        ),
      );
    }
  },
};