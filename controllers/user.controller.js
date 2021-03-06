const db = require("../models");
const UserModel = db.auth;
var multer = require('multer')
const fs = require("fs");
const Op = db.Sequelize.Op;
const moment = require('moment');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const  id  = req.user.id;
      console.log("ID: "+id)
      const path = `./public/uploads/avatars/${id}`
      fs.mkdirSync(path, { recursive: true })
      return cb(null, path)
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  

var upload = multer({ storage: storage }).single('file');

exports.readAllUsersController = (req, res) => {
    UserModel.findAll({where:{role:{ [Op.ne]: "superadmin"}}}).then(( users) => {
        if ( !users) {
            return res.status(400).json({
                error: 'No users found'
            });
        }
        res.json(users);
    });
};

exports.readController = (req, res) => {
    const userId = req.params.id;
    UserModel.findByPk(userId).then(( user) => {
        if ( !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
};


exports.readAllController = (req, res) => {
 
    const userId = req.user.id;
    const organization = req.user.organization;

    UserModel.findAll({where:{organization: organization, id: { [Op.ne]: userId }}}).then(( users) => {
        if ( users.length == 0) {
            return  res.json(users);
        }
        users.forEach(user => {
            user.hashed_password = undefined;
        user.salt = undefined;
        });
        res.json(users);
    });
};

exports.updateController = (req, res) => {
    const { firstname,lastname,email,phone } = req.body;

    UserModel.findByPk(req.user.id).then(user => {
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!firstname) {
            return res.status(400).json({
                error: 'First Name is required'
            });
        }
        if (!lastname) {
            return res.status(400).json({
                error: 'Last Name is required'
            });
        }
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        if(!phone){
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }
       
const updatedUser ={
    firstname:firstname,
    lastname:lastname,
    email:email,
    phone:phone
};
        user.update(updatedUser).then((updatedUser) => {
            
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
            
        }).catch(err=>{
                console.log('User Update ERROR', err);
                return res.status(400).json({
                    error: 'User Update failed'
                });
            
        });
    });
};
exports.updateUserController = (req, res) => {
    const {id, firstname,lastname,email,phone } = req.body;
    UserModel.findByPk(id).then(user => {
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!firstname) {
            return res.status(400).json({
                error: 'First Name is required'
            });
        }
        if (!lastname) {
            return res.status(400).json({
                error: 'Last Name is required'
            });
        }
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        if(!phone){
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }
       
const updatedUser ={
    firstname:firstname,
    lastname:lastname,
    email:email,
    phone:phone
};
        user.update(updatedUser).then((updatedUser) => {
            
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
            
        }).catch(err=>{
                console.log('User Update ERROR', err);
                return res.status(400).json({
                    error: 'User Update failed'
                });
            
        });
    });
};


exports.updateavatarController = (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        console.log( req.file)
        const updatedUser ={
   avatar:  req.file.filename
};
UserModel.findByPk(req.user.id).then(user => {
    if (!user) {
        return res.status(400).json({
            error: 'User not found'
        });
    }
        user.update(updatedUser).then((updatedUser) => {
            
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
            
        }).catch(err=>{
                return res.status(400).json({
                    error: 'User Update failed'
                });
            
    
    });
 })
})

};

exports.deleteController = (req, res) => {
    let id  =req.params.id;
    if(!id){
        id = req.user.id;
    }
    UserModel.findByPk(id).then(async user => {
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        
        try {
           await user.destroy();
            res.json("User account deleted");
        } catch (error) {
            console.log('User delete ERROR', err);
            return res.status(400).json({
                error: 'User delete failed'
            });
        }
       
    });
};

exports.getResultsForBarGraph =async (req, res)=>{
    
    const users = await UserModel.findAll({
        where:{role:{ [Op.ne]: "superadmin"}},
    group: 'createdAt'
      });
      if(!users){
          return res.json([]);
      }
                        var result = users.reduce(function (r, a) {
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