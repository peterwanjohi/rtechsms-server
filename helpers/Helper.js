
const moment = require("moment");


function calculateNextPayment(normalDate , days) {
    let currentDate;

        currentDate = moment(normalDate);
        currentDate.add(days, 'days').format('YYYY-MM-DD hh:mm');
        return currentDate;
  
}

module.exports.calculateNextPayment = calculateNextPayment;
