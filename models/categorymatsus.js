'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryMatsus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CategoryMatsus.hasMany(models.Matsus, {
        foreignKey: 'id_category'
      })
    }
  }
  CategoryMatsus.init({
    name: DataTypes.STRING,
    information: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'CategoryMatsus',
  });
  return CategoryMatsus;
};