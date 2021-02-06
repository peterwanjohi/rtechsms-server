const db = require("../models");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const MessageModel = db.message;

async function testDb(){


    let message ={
       text:'This is a sample test message',
       receipients: '[{ "statusCode": 101, "number": "+254711XXXYYY", "status": "Success", "cost": "KES 0.8000", "messageId": "ATPid_SampleTxnId123" }]',
       organization:'Tester',
       status:'sent'
    };
    
    MessageModel.create(message)
 .then(data => {
   console.log("Message Created: "+JSON.stringify(data));
 })
 .catch(err => {
    console.log("Message Creation eror: "+JSON.stringify(err));
 });
}
testDb();

function readDb(){
    MessageModel.findAll().then(messages=>{
        let  m = JSON.parse(messages[0].receipients);

        console.log("Messages: "+m[0].name);
    });
}

// readDb();