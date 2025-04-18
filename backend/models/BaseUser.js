// backend/models/BaseUser.js
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
  }
}, {
  tableName: 'BaseUsers',
  timestamps: false
});

module.exports = BaseUser;