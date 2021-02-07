const db = require("../models");
const MessageModel = db.message;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");
const africasTalking = require('africastalking');

exports.sendController = (req, res) => {
    const {message, receipients} =req.body;

    const organization = req.user.organization;

    console.log("Contacts: "+recipients);
        // MessageModel.findAll({where: {organization: organization}}).then(messages => {
        //     if (!messages) {
        //         return res.json([]);
        //     }
        //     res.json(messages);
        // });
    };

exports.saveDraftController = (req, res) => {
    const {message, recipients} =req.body;
    console.log("Resipients: "+JSON.stringify(recipients))
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

    MessageModel.findAll({where: {organization: organization}}).then(messages => {
        if (!messages) {
            return res.json([]);
        }
        res.json(messages);
    });
};
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