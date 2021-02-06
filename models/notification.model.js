'use strict';
module.exports = (sequelize, Sequelize) => {
    const notificationSchema = sequelize.define("notification", {
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     read: {
        type: Sequelize.BOOLEAN ,
        allowNull: false,
        defaultvalue:false
      },
      seen: {
        type: Sequelize.BOOLEAN ,
        allowNull: false,
        defaultvalue:false
      },
      receipient: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      
    });
    return notificationSchema;
};