const db = require("../models");
const ContactListModel = db.contacts;
const path = require('path');

exports.readContactsController = (req, res) => {
    const orgname = req.user.organization;
    console.log("req.user")

    ContactListModel.findAll({where:{organization: orgname}}).then(contacts => {
        if (!contacts) {
            return res.status(400).json({
                error: 'organization not found'
            });
        }
        // let contactsList = JSON.parse(contacts);
        res.json(contacts);
    });
};

exports.saveController = async (req, res) => {
    const { contacts ,group} = req.body;
    const orgname = req.user.organization;
    let contact ={
        group: group,
        contacts: contacts,
        organization:orgname,
     };
      const groupExists = await ContactListModel.findOne({where:{organization: orgname, group: group}});
      if(groupExists){
        return res.status(400).json({
          error: 'This group already exists.'
});
      }
     ContactListModel.create(contact)
  .then(data => {
    console.log("Contacts  saved: "+JSON.stringify(data));
    res.json(data);
  })
  .catch(err => {
     console.log("Contact save error: "+JSON.stringify(err));
     return res.status(400).json({
                            error: 'Error saving  contacts'
        });
  });
    
};

exports.deleteController = async (req, res) => {
    const group = req.params.group;
    const orgname = req.user.organization;
     
     const groupToDelete = await ContactListModel.findOne({where:{organization: orgname, group: group}});
  groupToDelete.destroy().then(data => {
    res.json("Contacts successfully deleted.");
  })
  .catch(err => {
     console.log("Contact delete error: "+JSON.stringify(err));
     return res.status(400).json({
                            error: 'Error deleting contacts'
        });
  });
    
};

exports.deleteController = (req, res) => {
  let id  =req.params.id;
 
  ContactListModel.findByPk(id).then(contact => {
      if (!contact) {
          return res.status(400).json({
              error: 'contact not found'
          });
      }
      
      contact.destroy().then(() => {
          
          res.json("contact deleted");
          
      }).catch(err=>{
              console.log('contact delete ERROR', err);
              return res.status(400).json({
                  error: 'contact delete failed'
              });
          
      });
  });
};