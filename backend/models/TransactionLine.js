const { DataTypes } = require('sequelize');
const sequelize       = require('../db');
const Transaction     = require('./Transaction');
const MasterAccount   = require('./MasterAccount');

const TransactionLine = sequelize.define('TransactionLine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creditedAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  debitedAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  comment: {
    type: DataTypes.STRING
  },
  TransactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Transaction,
      key: 'id'
    }
  },
  MasterAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: MasterAccount,
      key: 'id'
    }
  }
}, {
  tableName: 'TransactionLines',
  timestamps: false
});

// Links
Transaction.hasMany(TransactionLine, { foreignKey: 'TransactionId', as: 'lines' });
TransactionLine.belongsTo(Transaction, { foreignKey: 'TransactionId' });

MasterAccount.hasMany(TransactionLine, { foreignKey: 'MasterAccountId' });
TransactionLine.belongsTo(MasterAccount, { foreignKey: 'MasterAccountId' });

module.exports = TransactionLine;
