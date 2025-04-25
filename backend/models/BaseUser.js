const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BaseUser = sequelize.define('BaseUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'uniq_BaseUsers_userName'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'BaseUsers',
  timestamps: false
});

module.exports = BaseUser;
