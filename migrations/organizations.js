'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('organizations', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(organizations);
  }
};