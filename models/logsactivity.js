'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LogsActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LogsActivity.belongsTo(models.Users, {
        foreignKey: 'id_user'
      })
    }
  }
  LogsActivity.init({
    id_user: DataTypes.INTEGER,
    modul: DataTypes.STRING,
    action: DataTypes.STRING,
    old_data: DataTypes.JSONB,
    new_data: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'LogsActivity',
  });
  return LogsActivity;
};