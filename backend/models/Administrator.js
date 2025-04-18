const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BaseUser = require('./BaseUser');

const Administrator = sequelize.define('Administrator', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  dateHired: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dateFinished: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Administrators',
  timestamps: false
});

// CTI link
BaseUser.hasOne(Administrator, { foreignKey: 'id', as: 'adminProfile' });
Administrator.belongsTo(BaseUser, { foreignKey: 'id' });

module.exports = Administrator;
