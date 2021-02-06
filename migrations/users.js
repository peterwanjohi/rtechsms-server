'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('users', undefined);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(users);
  }
};