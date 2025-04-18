const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const AccountCategory = require('./AccountCategory');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  AccountCategoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: AccountCategory,
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'Groups',
  timestamps: false
});

// Links
AccountCategory.hasMany(Group, { foreignKey: 'AccountCategoryId' });
Group.belongsTo(AccountCategory, { foreignKey: 'AccountCategoryId', as: 'element' });

// Self‑recurse for parent/child
Group.hasMany(Group, { foreignKey: 'parentId', as: 'children' });
Group.belongsTo(Group, { foreignKey: 'parentId', as: 'parent' });

module.exports = Group;
