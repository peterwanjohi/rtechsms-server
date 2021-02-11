const cron = require('node-cron');
const moment = require("moment");

cron.schedule('* * * * *', async function (req, res, next) {
    let today_date = moment(new Date()).format("YYYY-MM-DD hh:mm");
    const find_organizations = await Organization.find();
    if (find_organizations) {
        for (let i = 0; i < find_organizations.length; i++) {
            let organizations = find_organizations[i];
            //format organization date to same format as today date then compare
            let paymentdueDate = moment(organizations.next_payment_date).format("YYYY-MM-DD hh:mm");
            if (today_date === paymentdueDate){
                let find_organization = await Organization.findById(organizations._id);
                find_organization.is_paid = false;
                find_organization.save();
            }
        }
    }
})
