const db = require("../models");
const MessageModel = db.message;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");
const sms = require('../services/sms');
const fetch = require("node-fetch");
const organizationModel = db.organization;
var PhoneNumber = require( 'awesome-phonenumber' );
var _ = require('lodash');
const moment = require('moment');

exports.sendController = async (req, res) => {
    const {message, receipients} =req.body;

    const organization = req.user.organization;
 const org = await organizationModel.findOne({where:{name: organization}});
 const country = org.country;
 if(!country){
  return  res.json("You have not a country for your organization.")
 }
let numbers =[];

await fetch("https://restcountries.eu/rest/v2/name/"+country.toLowerCase()).then(resp=>{
  return resp.json();
}).then(json=>{

  const code = json[0].alpha2Code;
  receipients.map(group =>{
    group.value.forEach(value =>{
numbers.push(new PhoneNumber( value.phone, code ).getNumber( 'e164' ))
    });
});
})

const orgUnits= org.units;
const clients = numbers.length;

if(orgUnits < clients){
    console.log(" org < cli", orgUnits <clients)
    return res.status(400).json({
        success: false,
        errors:"Your unit balance is too low to send the message to "+clients +" members. Please purchase more units and try  again."
      });  
}
 else{
    console.log(" org > cli", orgUnits > clients)
    const options = {
        to: numbers,
        message: message,
        from:'RTECHSMS'
    }
    sms.send(options)
        .then( async response => {
       console.log("Response: "+JSON.stringify(response))
      const rs =  response.SMSMessageData;
      const messageRecipients = rs.Recipients;
if(messageRecipients.length === 0){
    return res.status(400).json({
        success: false,
        errors:"Failed to send message. Please ensure all contacts are okay and you have a valid SenderId."
      });
}
      let unitsUsed = 0;
      messageRecipients.map(recipient =>{
          if(recipient.statusCode ===101 ){
              unitsUsed += 1;
          }
      });
      console.log("Units Used: "+unitsUsed)
      const unitsupdate = orgUnits - unitsUsed;

      await org.update({units: unitsupdate});

      const Message ={
        text: message,
        receipients: messageRecipients,
        organization: organization,
        status: 'sent'
    }
    MessageModel.create(Message).then(() => {
        res.json("Mesage sent successfully");
    })
    .catch(err => {
        return res.status(400).json({
            error: 'Error saving draft.'
        });
    });
        })
        .catch( error => {
            console.log(error);
            // return res.json("error");
        });
 }

    };

exports.saveDraftController = (req, res) => {
    const {message, recipients} =req.body;
        const organization = req.user.organization;
        const draftMessage ={
            text: message,
            receipients: recipients,
            organization: organization,
            status: 'draft'
        }
        
            MessageModel.create(draftMessage).then(messages => {
                res.json("Draft saved successfully");
            })
            .catch(err => {
                console.log("ERROR: "+err)
                return res.status(400).json({
                    error: 'Error saving draft.'
                });
            })
        };

exports.readAllController = (req, res) => {
const organization = req.user.organization;

    MessageModel.findAll({where: {organization: organization, status: 'sent' }}).then(messages => {
        if (!messages) {
            return res.json([]);
        }
        res.json(messages);
    });
};
exports.readDraftsController = (req, res) => {
    const organization = req.user.organization;
    
        MessageModel.findAll({where: {organization: organization, status: 'draft' }}).then(messages => {
            if (!messages) {
                return res.json([]);
            }
            res.json(messages);
        });
    };

exports.getResultsForBarGraph =async (req, res)=>{
    
    const messages = await MessageModel.findAll({
        where:{status:"sent", organization: req.user.organization},
    group: 'createdAt'
      });
      if(!messages){
          return res.json([]);
      }
                        var result = messages.reduce(function (r, a) {
                            r[moment(a.createdAt, 'YYYY/MM/DD').format('M')] = r[moment(a.createdAt, 'YYYY/MM/DD').format('M')] || [];
                            r[moment(a.createdAt, 'YYYY/MM/DD').format('M')].push(a);
                            return r;
                        }, Object.create(null));
                    
                    let graphRes ={};
                    let arrayForGraphres=[];
                    let keys= Object.keys(result);
                    keys.forEach(key =>{
                         graphRes[key] = result[key].length;
                         arrayForGraphres.push(graphRes)
                    })
                   return res.json(arrayForGraphres);
}

exports.readSingleController = (req, res) => {

    const id = req.params.id;

    MessageModel.findByPk(id).then(message => {
        if (!message) {
            return res.json([]);
        }
        res.json(message);
    });
};

exports.readAllMessagesController = (req, res) => {
    MessageModel.findAll().then(messages => {
        if (!messages) {
            return res.json([]);
        }
        res.json(messages);
    });
};

exports.deleteController = (req, res) => {
    let id =req.params.id;
   
    MessageModel.findByPk(id).then(message => {
        if (!message) {
            return res.status(400).json({
                error: 'message not found'
            });
        }
        
        message.destroy().then(() => {
            
            res.json("message deleted");
            
        }).catch(err=>{
                console.log('message delete ERROR', err);
                return res.status(400).json({
                    error: 'message delete failed'
                });
            
        });
    });
}
    exports.deletemessagesForOrganizationController = (req, res) => {
        let organization=req.user.organization;
       
        MessageModel.findAll({where:{organization: organization}}).then(messages => {
            if (!messages) {
                return res.status(400).json({
                    error: 'message not found'
                });
            }
            
            MessageModel.destroy(messages).then(() => {
                
                res.json("messages deleted");
                
            }).catch(err=>{
                    console.log('message delete ERROR', err);
                    return res.status(400).json({
                        error: 'message delete failed'
                    });
                
            });
        });

};


async function groupByDate(){
    const messages = await MessageModel.findAll({ where:{status:"sent"}});

      if(messages){
          console.log("Mess: "+messages)
       messages.forEach(message =>{
        // console.log("message.receipients: "+JSON.parse(message))

    //     // .map(recipient =>{
    //     //     if(recipient.statusCode ===101 ){
    //     //        console.log("FOund 1")
    //     //     }
    //     // });
       })
      }
                    //     var result = messages.reduce(function (r, a) {
                    //         r[moment(a.createdAt, 'YYYY/MM/DD').format('M')] = r[moment(a.createdAt, 'YYYY/MM/DD').format('M')] || [];
                    //         r[moment(a.createdAt, 'YYYY/MM/DD').format('M')].push(a);
                    //         return r;
                    //     }, Object.create(null));
                    
                    // let graphRes ={};
                    // let arrayForGraphres=[];
                    // let keys= Object.keys(result);
                    // keys.forEach(key =>{
                    //      graphRes[key] = result[key].length;
                    //      arrayForGraphres.push(graphRes)
                    // })
}
// groupByDate();