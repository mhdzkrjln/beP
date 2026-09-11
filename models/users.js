'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Users.hasMany(models.Matsus, {
        foreignKey: 'id_user'
      })
      Users.hasMany(models.Inmails, {
        foreignKey: 'id_user'
      })
      Users.hasMany(models.Outmails, {
        foreignKey: 'id_user'
      })
      Users.hasMany(models.LogsActivity, {
        foreignKey: 'id_user'
      })
    }
  }
  Users.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM(
        'Administrator',
        'User'
      ),
      defaultValue: 'User'
    },
    no_telp: DataTypes.STRING,
    last_login: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};