"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BorrowingDetails", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      loan_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      return_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      information_need: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "Dipinjam",
          "Dikembalikan",
          "Terlambat",
          "Dibatalkan",
        ),
        allowNull: false,
        defaultValue: "Dipinjam",
      },
      borrower_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      borrower_instansi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      borrower_no_telp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      borrower_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      borrower_category: {
        type: Sequelize.ENUM("Internal", "External"),
        allowNull: true,
      },
      id_matsus: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("BorrowingDetails", {
      fields: ["id_matsus"],
      type: "foreign key",
      name: "fk_borrowing_matsus",

      references: {
        table: "Matsus",
        field: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "BorrowingDetails",
      "fk_borrowing_matsus",
    );
    await queryInterface.dropTable("BorrowingDetails");
  },
};
