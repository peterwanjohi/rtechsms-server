const db = require("../models");
const MessageModel = db.message;
const sms = require('../services/sms');
const fetch = require("node-fetch");
const organizationModel = db.organization;
const NotificationModel = db.notification;
var PhoneNumber = require( 'awesome-phonenumber' );
var _ = require('lodash');
const moment = require('moment');

exports.sendController = async (req, res) => {
    const {message, receipients, draftId} =req.body;

    const organization = req.user.organization;
    const name= req.user.firstname;
    let sender = 'RTECHSMS';
 const org = await organizationModel.findOne({where:{name: organization}});

 if(org.plan === "Free Plan" && org.sent_messages >= 2 && !org.senderId){
    return res.status(400).json({
       success: false,
       errors:"You must have a valid senderId to send messages."
     });  
}
 if(org.senderId){
     sender = org.senderId;
 }

 const country = org.country;
 if(!country){
    return res.status(400).json({
        success: false,
        errors:"You have not set a country for your organization."
      }); }
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
const sent_messages= org.sent_messages;
const clients = numbers.length;

if(orgUnits < clients){
    return res.status(400).json({
        success: false,
        errors:"Your unit balance is too low to send the message to "+clients +" members. Please purchase more units and try  again."
      });  
}
 else{
    if(org.sent_messages >= 2 && !org.senderId){
        return res.status(400).json({
           success: false,
           errors:"You must have a valid senderId to send messages."
         });  
    }
    const options = {
        to: numbers,
        message: message,
        from:sender
    }
    sms.send(options)
        .then( async response => {
      const rs =  response.SMSMessageData;
      const messageRecipients = rs.Recipients;
             console.log("messageRecipients.length: "+messageRecipients.length)

if(messageRecipients.length === 0){
    return res.status(400).json({
        success: false,
        errors:"Failed to send message. Please ensure all contacts are okay and you have a valid SenderId."
      });
}
      let unitsUsed = 0;
      let recipientData =[]
      messageRecipients.map(recipient =>{
          if(recipient.statusCode ===101 ){
              unitsUsed += 1;
          }
       
          let resObj={statusCode:recipient.statusCode , number: recipient.number, status: recipient.status };

          recipientData.push(resObj);
      });
      const unitsupdate = orgUnits - unitsUsed;
      const updateMessages = sent_messages +1;

      await org.update({units: unitsupdate, sent_messages: updateMessages});

      const Message ={
        text: message,
        receipients: recipientData,
        organization: organization,
        status: 'sent'
    }
    MessageModel.create(Message).then(async () => {
        console.log("User =>",JSON.stringify(req.user))
        if(draftId){
        await updateDraft(draftId, organization);

        const notification = {
            message: `Dear ${name}. Your Message: ${message} has been sent .`,
            read: false,
            seen: false,
            receipient: req.user.id,
            type:'Message Sent'
            };
            await NotificationModel.create(notification);

        return res.json("Your message hass been sent successfully");
        }
        const notification = {
            message: `Dear ${name}. Your Message: '${message}' has been sent .`,
            read: false,
            seen: false,
            receipient: req.user.id,
            type:'Message Sent'
            };
            await NotificationModel.create(notification);
       return res.json("Mesage sent successfully");
    })
    .catch(async err => {
        const notification = {
            message: `Dear ${name}. Your Message: '${message}' has not been sent .`,
            read: false,
            seen: false,
            receipient: req.user.id,
            type:'Message Failed'
            };
            await NotificationModel.create(notification);
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

    MessageModel.findAll({
        where: {organization: organization, status: 'sent' },
        order: [
        ['createdAt', 'DESC']
        ]
  }).then(messages => {
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
                    let arrayForGraphs=[];
                    let keys= Object.keys(result);
                    keys.forEach(key =>{
                         graphRes[key] = result[key].length;
                         arrayForGraphs.push(graphRes)
                    })
                   return res.json(arrayForGraphs);
}
exports.getMessageCount = async (req,res)=>{
    const messages = await MessageModel.findAll({
        where:{status:"sent", organization: req.user.organization}, });
      if(!messages){
        console.log("count: ");

          return res.json({"count":0});
      }
      else {
        console.log("count: "+messages.length);

          return res.json({"count": messages.length})
      }
    
}
exports.getResultsForPieCount = async (req,res)=>{
    let delivered =0;
    let failed =0;
    const messages = await MessageModel.findAll({
        where:{status:"sent", organization: req.user.organization}});
      if(!messages){
          return res.json({"delivered":delivered, failed: failed});
      }
      else {
      messages.forEach(message =>{
          message.receipients.forEach(recipient=>{
              if(recipient.statusCode == 101){
                  delivered +=1;
              }
              else{
                  failed +=1;
              }
          })
      })

      return res.json({"delivered":delivered, failed: failed});
      }
    
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
            res.status(400).json({
                success: false,
                errors:"Message not found."
              });
        }
        
        message.destroy().then(() => {
            
            res.json("message deleted");
            
        }).catch(err=>{
                console.log('message delete ERROR', err);
                res.status(400).json({
                    success: false,
                    errors:"Failed to delete message."
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
                    res.status(400).json({
                        success: false,
                        errors:"Failed to delete message."
                      });
                
            });
        });

};

async function updateDraft(id, organization){
    MessageModel.findOne({where: {id: id,organization: organization, status: 'draft' }}).then(async message => {
        if (!message) {
            return false;
        }
     
   await message.destroy();
    return true;
    });
}

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
              
}
// groupByDate();