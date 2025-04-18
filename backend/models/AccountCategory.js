const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AccountCategory = sequelize.define('AccountCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Debit', 'Credit'),
    allowNull: false
  }
}, {
  tableName: 'AccountCategories',
  timestamps: false
});

module.exports = AccountCategory;
