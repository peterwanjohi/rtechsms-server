require('dotenv').config({
    path: './config/.env'
});

const dbUser = process.env.NODE_ENV ='development' ?  process.env.DBUSERTEST: process.env.DBUSER;
const dbPass = process.env.NODE_ENV ='development' ?  process.env.DBPASSTEST: process.env.DBPASS;

module.exports = {
    HOST: "localhost",
    USER: dbUser,
    PASSWORD: dbPass,
    DB: process.env.DB,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };