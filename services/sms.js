const credentials = {
    apiKey: process.env.APIKEY,         // use your sandbox app API key for development in the test environment
    username:process.env.SMSUSERNAME,      // use 'sandbox' for development in the test environment
};

const Africastalking = require('africastalking')(credentials);

// Initialize a service e.g. SMS
const sms = Africastalking.SMS
console.log("APIKEY: "+process.env.APIKEY)
console.log("USERNAME: "+process.env.SMSUSERNAME)
// Use the service

// Send message and capture the response or error
module.exports = sms;