const db = require("../models");
const UserModel = db.auth;
const OrganizationModel = db.organization;
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
var multer = require('multer')
const NotificationModel = db.notification;

const fs = require("fs");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const  organization  = req.user.organization;
      const path = `./public/uploads/logos/${organization}`
      fs.mkdirSync(path, { recursive: true })
      return cb(null, path)
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })

var upload = multer({ storage: storage }).single('file');

exports.readAllOrganizationController = (req, res) => {
    OrganizationModel.findAll().then(organizations => {
        if (!organizations) {
            return res.status(400).json({
                error: 'No organizations found'
            });
        }
        res.json(organizations);
    });
};


exports.readOrganizationController = (req, res) => {
    const orgname = req.user.organization;
    console.log("req.user")

    OrganizationModel.findOne({where:{name: orgname}}).then(organization => {
        if (!organization) {
            return res.json([]);
        }
        res.json(organization);
    });
};
exports.readOrganizationPayStatus = (req, res) => {
    const orgname = req.user.organization;
    OrganizationModel.findOne({where:{name: orgname}}).then(organization => {
        if (!organization) {
            return res.json([]);
        }
        res.json({paid: organization.is_paid,plan:organization.plan});
    });
};

exports.readOrganizationStatus = (req, res) => {
    const orgname = req.user.organization;
    OrganizationModel.findOne({where:{name: orgname}}).then(organization => {
        if (!organization) {
            return res.json([]);
        }
        res.json({status: organization.status,plan:organization.plan});
    });
};

exports.updateController = (req, res) => {
    const { name,address,city,country, motto, } = req.body;
    const orgname = req.user.organization;
    OrganizationModel.findOne({where:{name: orgname}}).then(organization => {
        if (!organization) {
            return res.status(400).json({
                error: 'Organization not found'
            });
        }
        if (!name) {
            return res.status(400).json({
                error: 'First Name is required'
            });
        }
        
        if (!address) {
            return res.status(400).json({
                error: 'Address is required'
            });
        }


        if(!city){
            return res.status(400).json({
                error: 'City is required'
            });
        }
        if(!country){
            return res.status(400).json({
                error: 'Country is required'
            });
        }
        if(!motto){
            return res.status(400).json({
                error: 'Motto is required'
            });
        }
       
const updatedorg={
    name:name,
    city:city,
    address:address,
    country:country,
    motto:motto
};
UserModel.findAll({where: {organization:organization.name}}).then( users=>{
    if(users){
        users.forEach(async user => {
            await user.update({organization: name});
        });
    }
        organization.update(updatedorg).then(async(updatedOrganization) => {
            const token = jwt.sign(
                {
                  id: req.user.id, organization: name,role: req.user.role
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: '24h'
                }
              );
              const notification = {
                message: `Dear ${req.user.firstname}. Your organization details have been updated.`,
                read: false,
                seen: false,
                receipient: req.user.id,
                type:'Organization Details Updated'
                };
                await NotificationModel.create(notification);
              
        //    let tokenObj = {"token": token};
           const returnObj = updatedOrganization.get({ plain: true});
           returnObj.token = token;
                
                console.log("updatedOrganization: "+JSON.stringify(returnObj));
            res.json(returnObj);
            
        }).catch(err=>{
                console.log('Organization Update ERROR', err);
                return res.status(400).json({
                    error: 'Organization Update failed'
                });
            
        });
    });
    });
};

exports.updateLogoController = (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        console.log( req.file)
        const updatedLogo ={
   logo:  req.file.filename
};
OrganizationModel.findOne({where:{name: req.user.organization}}).then(org => {
    if (!org) {
        return res.status(400).json({
            error: 'Organization not found'
        });
    }
        org.update(updatedLogo).then((updatedOrg) => {
            
            res.json(updatedOrg);
            
        }).catch(err=>{
                console.log('Logo Update ERROR', err);
                return res.status(400).json({
                    error: 'Logo Update failed'
                });
            
    
    });

 })
})

       

};

exports.deleteController = (req, res) => {
    let id  =req.params.id;
   
    OrganizationModel.findByPk(id).then(ation => {
        if (!organization) {
            return res.status(400).json([{
                error: 'organization not found'
            }]);
        }
        
        organization.destroy().then(() => {
            
            res.json("organization deleted");
            
        }).catch(err=>{
                console.log('organization delete ERROR', err);
                return res.status(400).json({
                    error: 'organization delete failed'
                });
            
        });
    });
};