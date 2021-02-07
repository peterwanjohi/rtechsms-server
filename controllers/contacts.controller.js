const db = require("../models");
const singleContactModel = require("../models/singleContact.model");
const ContactListModel = db.contacts;
const SingleContactModel = db.singleContacts;

exports.readContactsController = (req, res) => {
    const orgname = req.user.organization;
    console.log("req.user")

    ContactListModel.findAll({where:{organization: orgname}}).then(contacts => {
        if (!contacts) {
            return res.status(400).json({
                error: 'organization not found'
            });
        }
        res.json(contacts);
    });
};

exports.readAllSingleContactsController = (req, res) => {
    console.log("req.user")

    SingleContactModel.findAll({where:{organization: orgname}}).then(contacts => {
        if (!contacts) {
            return res.status(400).json({
                error: 'organization not found'
            });
        }
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

exports.saveSingleController = async (req, res) => {
    const { name, phone } = req.body;
    const orgname = req.user.organization;
    let contact ={
        name: name,
        phone: phone,
        organization:orgname,
     };

      const contactExists = await SingleContactModel.findOne({where:{organization: orgname, phone: phone}});
      if(contactExists){
        return res.status(400).json({
          error: 'This contact already exists.'
});
      }
     SingleContactModel.create(contact)
  .then(data => {
    console.log("Contacts  saved: "+JSON.stringify(data));
    res.json(data);
  })
  .catch(err => {
     console.log("Contact save error: "+JSON.stringify(err));
     return res.status(400).json({
                            error: 'Error saving  contact'
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

exports.deleteSingleController = (req, res) => {
  let id  =req.params.id;
 
  singleContactModel.findByPk(id).then(contact => {
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