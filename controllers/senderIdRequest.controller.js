const db = require("../models");
const SenderIdModel = db.sendeidrequests;
const OrganizationModel = db.organization;
const UserModel = db.auth;
const NotificationModel = db.notification;

const mail = require("../services/mail");
exports.readAllController = (req, res) => {
    SenderIdModel.findAll({order: [
        ['createdAt', 'DESC']
        ]}).then(senderIds => {
        if (!senderIds) {
            return res.json([]);
        }
        res.json(senderIds);
    });
};

exports.readSingleController = (req, res) => {
    const name = req.params.name;
    SenderIdModel.findOne({where:{name: name}}).then(senderId => {
        if (!senderId) {
            return res.status(400).json({
                error: 'senderId not found'
            });
        }
        res.json(senderId);
    });
};

exports.saveController = async (req, res) => {
    const { name, organization} = req.body;
    let senderId ={
      name: name,
      organization: organization,
      state: "pending"
     };
      const senderIdExists = await SenderIdModel.findOne({where:{name: name}});
      if(senderIdExists){
        return res.status(400).json({
          error: 'This senderId already exists.'
});
      }
     SenderIdModel.create(senderId)
  .then(data => {
    console.log("senderIds  saved: "+JSON.stringify(data));
    res.json(data);
  })
  .catch(err => {
     console.log("senderId save error: "+JSON.stringify(err));
     return res.status(400).json({
                            error: 'Error saving  senderds'
        });
  });
    
};

exports.approveController = async (req, res) => {
    const {name, organization} = req.body;
     
     const senderIdToUpdate = await SenderIdModel.findOne({where:{organization: organization, name: name}});

     if(!senderIdToUpdate) return res.status(400).json({
        error: 'SenderId not found'
        });
        let update = {
            state: 'approved'
        };

        await senderIdToUpdate.update(update);

        OrganizationModel.findOne({where :{name: organization}}).then(org =>{
            if(!org) return res.status(400).json({
                error: 'Organization not found'
                });
                let updatedSenderId ={
                    senderId: name
                }
                org.update(updatedSenderId).then(async()=>{
                    const admin= await UserModel.findOne({where: {organization : org.name, role:"admin"}});
                    const notification = {
                        message: `Dear ${admin.firstname}. Your senderId has been approved!`,
                        read: false,
                        seen: false,
                        receipient: admin.id,
                        type:'primary'
                        };
                        await NotificationModel.create(notification);
                    mail.sendMail(res,process.env.FROM, admin.email,'SenderId Approved.', `SenderId Approved.`, `Hello ${admin.firstname}. Your senderId ,<strong> ${name} </strong> been approved and activated.You are now able to send bulk SMS using this sender Id.</p>
                    <p>Thank you for choosing Rtech SMS.</p>`,"Your senderId has been approved and activated.")
                      res.json("Senderid approved successfully");
                    res.json("Sender Id Updated");
                }).catch(err =>{
                    console.log("Er:"+err)
                    return res.status(400).json({
                        error: 'SenderId update failed.'
                        });
                })
        })

    
};

exports.deleteController = async (req, res) => {
    const name = req.params.name; 
    const organization = req.params.organization;
     const senderIdToDelete = await SenderIdModel.findOne({where:{organization: organization, name: name}});
     if(!senderIdToDelete) return res.status(400).json({
        error: 'SenderId not found'
});
  senderIdToDelete.destroy().then(data => {
    res.json("senderId successfully deleted.");
  })
  .catch(err => {
     console.log("senderId delete error: "+JSON.stringify(err));
     return res.status(400).json({
                            error: 'Error deleting senderId'
        });
  });
    
};