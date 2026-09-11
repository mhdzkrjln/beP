'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Matsus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Matsus.belongsTo(models.CategoryMatsus, {
        foreignKey: 'id_category'
      });
      Matsus.belongsTo(models.Users, {
        foreignKey: 'id_user'
      });
      Matsus.hasMany(models.BorrowingDetails, {
        foreignKey: 'id_matsus'
      })
    }
  }
  Matsus.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: DataTypes.STRING,
    id_category: DataTypes.INTEGER,
    total_item: DataTypes.INTEGER,
    available_item: DataTypes.INTEGER,
    location: DataTypes.STRING,
    condition: {
      type: DataTypes.ENUM(
        'Baik',
        'Rusak',
        'Hilang'
      )
    },
    foto: {
      type: DataTypes.STRING,
      get(){
        const filename = this.getDataValue('foto')
        if (!filename) return null;
        return `http://localhost:2000/uploads/${filename}`;
      }
    },
    information: DataTypes.TEXT,
    id_user: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Matsus',
  });
  return Matsus;
};