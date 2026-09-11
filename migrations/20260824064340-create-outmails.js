"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Outmails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      no_mail: {
        type: Sequelize.STRING,
      },
      date_mail: {
        type: Sequelize.DATE,
      },
      date_sent: {
        type: Sequelize.DATE,
      },
      destination: {
        type: Sequelize.STRING,
      },
      about: {
        type: Sequelize.STRING,
      },
      information: {
        type: Sequelize.TEXT,
      },
      classification: {
        type: Sequelize.ENUM(
          'Internal',
          'External'
        ),
      },
      tembusan: {
        type: Sequelize.STRING,
      },
      file: {
        type: Sequelize.STRING,
      },
      is_arsip: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.addConstraint("Outmails", {
      fields: ["id_user"],
      type: "foreign key",
      name: "fk_outmails_users_id",

      references: {
        table: "Users",
        field: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "Outmails", 
      "fk_outmails_users_id"
    );
    await queryInterface.dropTable("Outmails");
  },
};
