const express = require('express')
const morgan = require('morgan')
// const connectDB = require('./config/db')
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require("./models");
const cron = require('node-cron');
const moment = require("moment");
const OrganizationModel = db.organization;
const NotificationModel = db.notification;
const UserModel = db.auth;

// Config dotev
require('dotenv').config({
    path: './config/.env'
})


const app = express()

// Connect to database
// connectDB();

// body parser
// app.use(bodyParser.json())
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(express.static(__dirname + '/public'));

// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
//   });

// Load routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const paymentsRouter = require('./routes/payments.route');
const organizationRouter = require('./routes/organization.route');
const contactsRouter = require('./routes/contacts.route');
const plansRouter = require('./routes/plan.route');
const senderIdRouter = require('./routes/senderid.route');
const messageRouter = require('./routes/message.route');
const { unitPaymentCancelController } = require('./controllers/payments.controller');


// Dev Logginf Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }))
    app.use(morgan('dev'))
}

//Enable cors
app.use(cors());

// Use Routes
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', paymentsRouter);
app.use('/api', organizationRouter);
app.use('/api', contactsRouter);
app.use('/api', plansRouter);
app.use('/api', senderIdRouter);
app.use('/api', messageRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: "Page not  found"
    })
});


   


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
cron.schedule('* * * * *',  async function (req, res, next) {
    let today_date = moment(new Date()).format("YYYY-MM-DD hh:mm");
    const find_organizations = await OrganizationModel.findAll();
    if (find_organizations) {
        for (let i = 0; i < find_organizations.length; i++) {
            let organizations = find_organizations[i];

            //format organization date to same format as today date then compare
            if(organizations.next_payment_date){
                let paymentdueDate = moment(organizations.next_payment_date).format("YYYY-MM-DD hh:mm");
                let find_organization = await OrganizationModel.findByPk(organizations.id);

                const admin =await UserModel.findOne({where: {organization: find_organization.name, role: "admin"}});
                const days=moment().diff(organizations.next_payment_date,"days");
                const days_remaining=  Math.abs( days)
                if(days < 0 && days > -7){
                    console.log("hehe")
                    const notification={
                        message: `Dear ${admin.firstname}, your subscription expires in ${days_remaining} days.`,
                    read: false,
                    seen: false,
                    receipient: admin.id,
                    type:'danger'
                    };
                    await NotificationModel.create(notification);
                    console.log("message: "+notification.message)
                }
              
                if (today_date === paymentdueDate){
                   
                    const updated_organization ={
                        is_paid: false
                    }
                    await find_organization.update(updated_organization);
                }
            }
           
        }
    }

});
// db.sequelize.sync({ alter: true });