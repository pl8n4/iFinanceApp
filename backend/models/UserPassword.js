const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BaseUser = require('./BaseUser');

const UserPassword = sequelize.define('UserPassword', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  encryptedPassword: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordExpiryTime: {
    type: DataTypes.INTEGER
  },
  userAccountExpiryDate: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'UserPasswords',
  timestamps: false
});

// 1–to–1 link
BaseUser.hasOne(UserPassword, { foreignKey: 'id', as: 'shadow' });
UserPassword.belongsTo(BaseUser, { foreignKey: 'id' });

module.exports = UserPassword;
