'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const messageSchema = sequelize.define("message", {
      text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      receipients: {
        type: Sequelize.STRING ,
        allowNull: false,
        get: function() {
          return JSON.parse(this.getDataValue('receipients'));
      }, 
      set: function(val) {
          return this.setDataValue('receipients', JSON.stringify(val));
      }
      },
      organization: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      
    });
    Temporal(messageSchema, sequelize);
    return messageSchema;
};