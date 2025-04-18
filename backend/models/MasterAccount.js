const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Group = require('./Group');

const MasterAccount = sequelize.define('MasterAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  openingAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  closingAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  GroupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Group,
      key: 'id'
    }
  }
}, {
  tableName: 'MasterAccounts',
  timestamps: false
});

// Link to Group
Group.hasMany(MasterAccount, { foreignKey: 'GroupId' });
MasterAccount.belongsTo(Group, { foreignKey: 'GroupId', as: 'accountGroup' });

module.exports = MasterAccount;
