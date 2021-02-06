'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('plans', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(plans);
  }
};