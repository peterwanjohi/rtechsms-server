'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
  const adminSchema = sequelize.define("user", {
    organization: {
      type: Sequelize.STRING,
      allowNull: false,
      
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hashed_password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    resetPasswordLink: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    verificationCode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive:{
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    last_login:{
      type: Sequelize.DATE
    }
  });
  Temporal(adminSchema, sequelize);
  return adminSchema;
};

