'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LogsActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_user: {
        type: Sequelize.INTEGER
      },
      modul: {
        type: Sequelize.STRING
      },
      action: {
        type: Sequelize.STRING
      },
      old_data: {
        type: Sequelize.JSONB
      },
      new_data: {
        type: Sequelize.JSONB
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint("LogsActivities", {
      fields: ["id_user"],
      type: "foreign key",
      name: "fk_logs_users",

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
      'LogsActivities',
      'fk_logs_users'
    );
    await queryInterface.dropTable('LogsActivities');
  }
};