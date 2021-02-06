'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('messages', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(messages);
  }
};