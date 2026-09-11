'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inmails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_mail: {
        type: Sequelize.STRING
      },
      date_mail: {
        type: Sequelize.DATE
      },
      date_received: {
        type: Sequelize.DATE
      },
      sender: {
        type: Sequelize.STRING
      },
      about: {
        type: Sequelize.STRING
      },
      information: {
        type: Sequelize.TEXT
      },
      classification: {
        type: Sequelize.ENUM(
          'Internal',
          'External'
        ),
      },
      file: {
        type: Sequelize.STRING
      },
      is_arsip: {
        type: Sequelize.BOOLEAN
      },
      id_user: {
        type: Sequelize.INTEGER
      },
      deleted_at: {
        type: Sequelize.DATE
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
    await queryInterface.addConstraint('Inmails', {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'fk_inmails_users_id',

      references: {
        table: 'Users',
        field: 'id'
      },

      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'Inmails',
      'fk_inmails_users_id'
    )
    
    await queryInterface.dropTable('Inmails');
  }
};