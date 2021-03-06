'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const organizationSchema = sequelize.define("organization", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      motto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      units: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue: 2
      },
      sent_messages: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue: 0
      },
      users: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue: 1
      },
      is_paid: {
        type: Sequelize.BOOLEAN ,
        allowNull: false,
        defaultvalue: false
      },
      next_payment_date: {
         type: Sequelize.DATE
      },
      plan:{
            type:Sequelize.STRING,
            defaultvalue:null
        },
        status:{
          type:Sequelize.STRING,
          allowNull: false,
          defaultvalue:'active'
        },
        senderId:{
            type:Sequelize.STRING,
            defaultvalue:null
        },
        logo:{
            type:Sequelize.STRING,
             defaultvalue:null
            }
    });
    Temporal(organizationSchema, sequelize);
    return organizationSchema;
};