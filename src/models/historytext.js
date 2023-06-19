'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Historytext extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Historytext.init({
    text: DataTypes.STRING,
    result: DataTypes.STRING,
    type: DataTypes.STRING,
    datetime: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Historytext',
  });
  return Historytext;
};