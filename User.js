const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  referralCode: { type: DataTypes.STRING, unique: true },
  referredBy: { type: DataTypes.STRING }
});

module.exports = User;
