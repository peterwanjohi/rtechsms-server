'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const contactSchema = sequelize.define("singlecontact", {
      name: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
    });
    Temporal(contactSchema, sequelize);
    return contactSchema;
};