'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Outmails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Outmails.belongsTo(models.Users, {
        foreignKey: 'id_user'
      })
    }
  }
  Outmails.init({
    no_mail: DataTypes.STRING,
    date_mail: DataTypes.DATE,
    date_sent: DataTypes.DATE,
    destination: DataTypes.STRING,
    about: DataTypes.STRING,
    information: DataTypes.TEXT,
    classification: {
      type: DataTypes.ENUM(
        'Internal',
        'External'
      )
    },
    tembusan: DataTypes.STRING,
    file: DataTypes.STRING,
    is_arsip: DataTypes.BOOLEAN,
    id_user: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Outmails',
  });
  return Outmails;
};