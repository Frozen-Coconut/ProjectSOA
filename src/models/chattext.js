'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chattext extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chattext.init({
    id_chat: DataTypes.STRING,
    input: DataTypes.STRING,
    reply: DataTypes.STRING,
    datetime: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Chattext',
  });
  return Chattext;
};