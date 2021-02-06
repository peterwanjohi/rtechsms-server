'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('notifications', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(notifications);
  }
};