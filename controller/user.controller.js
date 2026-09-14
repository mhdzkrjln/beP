const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const { Users } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { response } = require("../helpers/response.formatter");

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json(response(400, "Username dan password wajib diisi"));
      }

      const user = await Users.findOne({
        where: {
          username,
          deleted_at: null,
        },
      });

      if (!user) {
        return res
          .status(401)
          .json(response(401, "Username atau password salah"));
      }

      if (!user.is_active) {
        return res.status(403).json(response(403, "Akun tidak aktif"));
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json(response(401, "Username atau password salah"));
      }

      await user.update({
        last_login: new Date(),
      });

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      const token = generateToken(payload);
      const userData = user.toJSON();
      delete userData.password;

      return res.status(200).json(
        response(200, "Login berhasil", {
          user: userData,
          token,
        }),
      );
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  register: async (req, res) => {
    try {
      const { name, username, password, role, no_telp } = req.body;

      if (!name || !username || !password) {
        return res
          .status(400)
          .json(response(400, "name, username, dan password wajib diisi"));
      }

      const existingUser = await Users.findOne({
        where: { username, deleted_at: null },
      });

      if (existingUser) {
        return res.status(400).json(response(400, "Username sudah digunakan"));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await Users.create({
        name,
        username,
        password: hashedPassword,
        role,
        no_telp,
        is_active: true,
      });

      const result = user.toJSON();
      delete result.password;

      return res.status(201).json(response(201, "Register berhasil", result));
    } catch (error) {
      console.error("DEBUG ERROR:", error);
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  getAll: async (req, res) => {
    try {
      const {
        search = "",
        role,
        is_active,
        page = 1,
        limit = 4,
        sortBy = "id",
        sortOrder = "ASC",
      } = req.query;

      const pageNumber = Math.max(Number(page), 1);

      const limitNumber = Math.max(Number(limit), 1);

      const offset = (pageNumber - 1) * limitNumber;

      const where = {
        deleted_at: null,
      };

      if (search) {
        where[Op.or] = [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            username: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            no_telp: {
              [Op.like]: `%${search}%`,
            },
          },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (is_active !== undefined) {
        where.is_active = is_active === "true" || is_active === true;
      }

      const allowedSort = [
        "id",
        "name",
        "username",
        "role",
        "is_active",
        "createdAt",
        "updatedAt",
      ];

      const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "id";

      const safeSortOrder =
        String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

      const { count, rows } = await Users.findAndCountAll({
        where,

        attributes: {
          exclude: ["password"],
        },

        order: [[safeSortBy, safeSortOrder]],

        limit: limitNumber,
        offset,
      });

      const total = await Users.count({
        where: {
          deleted_at: null,
        },
      });

      const active = await Users.count({
        where: {
          deleted_at: null,
          is_active: true,
        },
      });

      const inactive = await Users.count({
        where: {
          deleted_at: null,
          is_active: false,
        },
      });

      return res.status(200).json(
        response(200, "Data pengguna berhasil diambil", {
          data: rows,

          pagination: {
            total: count,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(count / limitNumber),
          },

          statistics: {
            total,
            active,
            inactive,
          },
        }),
      );
    } catch (error) {
      console.error("GET USER ERROR:", error);

      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await Users.findOne({
        where: {
          id,
          deleted_at: null,
        },
        attributes: {
          exclude: ["password"],
        },
      });

      if (!user) {
        return res.status(404).json(response(404, "User not found"));
      }

      return res.status(200).json(response(200, "Success", user));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const { name, username, password, role, no_telp, is_active } = req.body;

      const user = await Users.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!user) {
        return res.status(404).json(response(404, "User not found"));
      }

      if (username && username.trim() !== user.username) {
        const existingUser = await Users.findOne({
          where: {
            username: username.trim(),
            deleted_at: null,

            id: {
              [Op.ne]: id,
            },
          },
        });

        if (existingUser) {
          return res
            .status(409)
            .json(response(409, "Username sudah digunakan"));
        }
      }

      let activeValue = user.is_active;

      if (is_active !== undefined) {
        if (typeof is_active === "boolean") {
          activeValue = is_active;
        } else if (is_active === "true") {
          activeValue = true;
        } else if (is_active === "false") {
          activeValue = false;
        }
      }

      const updateData = {
        name: name !== undefined ? name.trim() : user.name,

        username: username !== undefined ? username.trim() : user.username,

        role: role !== undefined ? role : user.role,

        no_telp: no_telp !== undefined ? no_telp.trim() : user.no_telp,

        is_active: activeValue,
      };

      if (password && password.trim()) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updateData);
      const result = user.toJSON();

      delete result.password;

      return res
        .status(200)
        .json(response(200, "User berhasil diupdate", result));
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);

      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  softDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await Users.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!user) {
        return res.status(404).json(response(404, "User not found"));
      }

      await user.update({
        deleted_at: new Date(),
      });

      return res.status(200).json(response(200, "User berhasil dihapus"));
    } catch (error) {
      return res
        .status(500)
        .json(response(500, "Failed to delete user", error.message));
    }
  },
};
