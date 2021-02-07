'use strict';
var Temporal = require('sequelize-temporal');
module.exports = (sequelize, Sequelize) => {
    const planSchema = sequelize.define("plan", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     price: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue:0
      },
    
      maxUsers: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue:1
      },
    });
    Temporal(planSchema, sequelize);
    return planSchema;
};