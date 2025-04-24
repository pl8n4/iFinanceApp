const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BaseUser = require('./BaseUser');
const Administrator = require('./Administrator');

const NonAdminUser = sequelize.define('NonAdminUser', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  address: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: 'uniq_NonAdminUsers_email'
  },
  AdministratorId: { 
    type: DataTypes.UUID,
    references: {
      model: Administrator,
      key: 'id'
    },
    allowNull: true
  }
}, {
  tableName: 'NonAdminUsers',
  timestamps: false
});

// CTI link
BaseUser.hasOne(NonAdminUser, { foreignKey: 'id', as: 'userProfile' });
NonAdminUser.belongsTo(BaseUser, { foreignKey: 'id' });

// Link to Administrator
Administrator.hasMany(NonAdminUser, { foreignKey: 'AdministratorId' });
NonAdminUser.belongsTo(Administrator, { foreignKey: 'AdministratorId' });

module.exports = NonAdminUser;
