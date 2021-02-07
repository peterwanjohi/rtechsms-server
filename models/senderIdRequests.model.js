'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const senderIdSchema = sequelize.define("senderidrequests", {
      name: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
    });
    Temporal(senderIdSchema, sequelize);
    return senderIdSchema;
};