"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Matsus", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
      },
      id_category: {
        type: Sequelize.INTEGER,
      },
      total_item: {
        type: Sequelize.INTEGER,
      },
      available_item: {
        type: Sequelize.INTEGER,
      },
      location: {
        type: Sequelize.STRING,
      },
      condition: {
        type: Sequelize.ENUM("Baik", "Rusak", "Hilang"),
        defaultValue: "Baik",
      },
      foto: {
        type: Sequelize.STRING,
      },
      information: {
        type: Sequelize.TEXT,
      },
      id_user: {
        type: Sequelize.INTEGER,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addConstraint("Matsus", {
      fields: ["id_category"],
      type: "foreign key",
      name: "fk_matsus_category",

      references: {
        table: "CategoryMatsus",
        field: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("Matsus", {
      fields: ["id_user"],
      type: "foreign key",
      name: "fk_matsus_users",

      references: {
        table: "Users",
        field: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Matsus", "fk_matsus_category");

    await queryInterface.removeConstraint("Matsus", "fk_matsus_users");

    await queryInterface.dropTable("Matsus");
  },
};
