
module.exports = (sequelize, Sequelize) => {
    const paymentSchema = sequelize.define("unitpayment", {
      organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     amount: {
        type: Sequelize.INTEGER ,
        allowNull: false,
        defaultvalue:0
      },
      date: {
        type: Sequelize.DATE ,
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
     
      state: {
        type: Sequelize.STRING ,
        allowNull: false,
      },
      
    });
    return paymentSchema;
};