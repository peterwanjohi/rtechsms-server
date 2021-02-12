const credentials = {
    apiKey: process.env.APIKEY,         // use your sandbox app API key for development in the test environment
    username:process.env.SMSUSERNAME,      // use 'sandbox' for development in the test environment
};

const Africastalking = require('africastalking')(credentials);

const sms = Africastalking.SMS

module.exports = sms;