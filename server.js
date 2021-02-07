const express = require('express')
const morgan = require('morgan')
const connectDB = require('./config/db')
const bodyParser = require('body-parser')
const cors = require('cors');
const db = require("./models");
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

db.sequelize.sync({ alter: true });