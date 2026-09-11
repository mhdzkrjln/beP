"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BorrowingDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BorrowingDetails.belongsTo(models.Matsus, {
        foreignKey: "id_matsus",
      });
    }
  }
  BorrowingDetails.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      loan_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      return_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      information_need: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "Dipinjam",
          "Dikembalikan",
          "Terlambat",
          "Dibatalkan",
        ),
        allowNull: false,
        defaultValue: "Dipinjam",
      },

      borrower_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      borrower_instansi: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      borrower_no_telp: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      borrower_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      borrower_category: {
        type: DataTypes.ENUM("Internal", "External"),
        allowNull: true,
      },

      id_matsus: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BorrowingDetails",
    },
  );
  return BorrowingDetails;
};
