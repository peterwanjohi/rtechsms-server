
'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const paymentSchema = sequelize.define("senderidpayment", {
      organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     amount: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue:0
      },
      date: {
        type: Sequelize.DATE ,
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      senderId:
      {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      mpesaCode:
      {
        type: Sequelize.STRING ,
        allowNull: false,
        
      },
      state: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      
    });
    Temporal(paymentSchema, sequelize);
    return paymentSchema;
};