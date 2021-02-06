'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('contacts', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(contacts);
  }
};