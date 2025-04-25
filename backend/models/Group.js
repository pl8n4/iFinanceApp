const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const AccountCategory = require('./AccountCategory');
const NonAdminUser = require('./NonAdminUser');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'uniq_Groups_owner_name'
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
  },
  NonAdminUserId: {
  type: DataTypes.UUID,
  allowNull: false,
  references: {
    model: require('./NonAdminUser'),
    key: 'id'
  },
  unique: 'uniq_Groups_owner_name'
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

// Defines the relationship between Group and NonAdminUser
NonAdminUser.hasMany(Group, { foreignKey: 'NonAdminUserId', as: 'groups' });
Group.belongsTo(NonAdminUser, { foreignKey: 'NonAdminUserId', as: 'owner' });


module.exports = Group;