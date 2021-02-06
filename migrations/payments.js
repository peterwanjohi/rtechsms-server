'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('payments', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(payments);
  }
};