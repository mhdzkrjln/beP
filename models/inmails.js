'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inmails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Inmails.belongsTo(models.Users, {
        foreignKey: 'id_user'
      })
    }
  }
  Inmails.init({
    no_mail: DataTypes.STRING,
    date_mail: DataTypes.DATE,
    date_received: DataTypes.DATE,
    sender: DataTypes.STRING,
    about: DataTypes.STRING,
    information: DataTypes.TEXT,
    classification: {
      type: DataTypes.ENUM(
        'Internal',
        'External'
      )
    },
    file: {
      type: DataTypes.STRING,
      get(){
        const filename = this.getDataValue('file');
        if (!filename) return null;
        return `http://localhost:2000/uploads/${filename}`;
      }
    },
    is_arsip: DataTypes.BOOLEAN,
    id_user: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Inmails',
  });
  return Inmails;
};