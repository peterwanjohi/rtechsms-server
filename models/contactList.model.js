
'use strict';
module.exports = (sequelize, Sequelize) => {
    const contactSchema = sequelize.define("contacts", {
      group: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contacts: {
        type: Sequelize.STRING ,
        allowNull: false,
        get: function() {
          return JSON.parse(this.getDataValue('contacts'));
      }, 
      set: function(val) {
          return this.setDataValue('contacts', JSON.stringify(val));
      }
      },
      organization: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
    });
    return contactSchema;
};