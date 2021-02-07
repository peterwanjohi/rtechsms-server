const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.auth= require("./auth.model.js")(sequelize, Sequelize);
db.contacts= require("./contactList.model.js")(sequelize, Sequelize);
db.message= require("./message.model.js")(sequelize, Sequelize);
db.notification= require("./notification.model.js")(sequelize, Sequelize);
db.organization= require("./organization.model.js")(sequelize, Sequelize);
db.payments= require("./subscriptionPayments.model.js")(sequelize, Sequelize);
db.unitpayments= require("./unitPayments.model.js")(sequelize, Sequelize);
db.sendeidrequests= require("./senderIdRequests.model.js")(sequelize, Sequelize);
db.singleContacts= require("./singleContact.model.js")(sequelize, Sequelize);
db.plan= require("./plan.model.js")(sequelize, Sequelize);
db.senderidpayments= require("./senderIdPayment.model.js")(sequelize, Sequelize);

module.exports = db;