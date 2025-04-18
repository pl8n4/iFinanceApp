const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BaseUser = require('./BaseUser');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.STRING
  },
  NonAdminUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: require('./NonAdminUser'),
      key: 'id'
    }
  }
}, {
  tableName: 'Transactions',
  timestamps: false
});

// Link author
BaseUser.hasMany(Transaction, { foreignKey: 'NonAdminUserId' });
Transaction.belongsTo(BaseUser, { foreignKey: 'NonAdminUserId', as: 'author' });

module.exports = Transaction;
