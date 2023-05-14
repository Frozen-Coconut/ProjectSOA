'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat_text extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chat_text.init({
    id: DataTypes.INTEGER,
    id_chat: DataTypes.STRING,
    input: DataTypes.STRING,
    reply: DataTypes.STRING,
    datetime: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Chat_text',
  });
  return Chat_text;
};
