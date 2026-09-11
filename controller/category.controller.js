const { CategoryMatsus, Matsus, sequelize } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
  create: async (req, res) => {
    try {
      const { name, information } = req.body;
      if (!name.trim()) {
        return res.status(400).json(response(400, "Nama kategori wajib diisi"));
      }
      const cekKategori = await CategoryMatsus.findOne({
        where: { name: name.trim() },
      });
      if (cekKategori) {
        return res
          .status(400)
          .json(response(400, "Nama kategori sudah tersedia"));
      }
      const kategori = await CategoryMatsus.create({
        name: name.trim(),
        information: information.trim() || null,
      });
      return res
        .status(201)
        .json(response(201, "Data berhasil dibuat", kategori));
    } catch (error) {}
  },
  getAll: async (req, res) => {
    try {
      const categories = await CategoryMatsus.findAll({
        attributes: [
          "id",
          "name",
          "information",
          "createdAt",
          "updatedAt",
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("Matsus.total_item")),
              0,
            ),
            "total_unit",
          ],
        ],
        include: [
          {
            model: Matsus,
            attributes: [],
          },
        ],
        group: ["CategoryMatsus.id"],
      });

      return res
        .status(200)
        .json(response(200, "Berhasil mengambil data", categories));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, information } = req.body;

      const kategori = await CategoryMatsus.findByPk(id);
      if (!kategori) {
        return res.status(404).json(response(404, "Data tidak ditemukan"));
      }
      if (!name.trim()) {
        return res
          .status(400)
          .json(response(400, "Nama kategori tidak boleh kosong"));
      }
      await kategori.update({
        name: name ? name.trim() : kategori.name,
        information:
          information !== undefined ? information.trim() : kategori.information,
      });
      return res
        .status(200)
        .json(response(200, "Data berhasil diperbarui", kategori));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const kategori = await CategoryMatsus.findByPk(id);
      if (!kategori) {
        return res.status(404).json(response(404, "Data tidak ditemukan"));
      }
      await kategori.destroy()
      return res.status(200).json(response(200, "Data berhasil dihapus"))
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },
};
