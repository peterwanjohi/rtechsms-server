const db = require("../models");
const crypto = require('crypto');
const UserModel = db.auth;
const PlansModel = db.plan;

async function seedAdmin(){

    let hashed_passwordObj = hashPassword(process.env.SUPERADMINPASSWORD);

    let newUser ={
        firstname: process.env.SUPERADMINFNAME,
        lastname: process.env.SUPERADMINLNAME,
        organization:'none',
        email: process.env.SUPERADMINEMAIL,
        phone: process.env.SUPERADMINPHONE,
        hashed_password: hashed_passwordObj.hashed_password,
        salt: hashed_passwordObj.salt,
        isActive: true,
        role: 'superadmin'
    };
    
    UserModel.create(newUser)
 .then(data => {
   console.log("SuperAdmin Created: "+JSON.stringify(data));
 })
 .catch(err => {
    console.log("SuperAdmin Creation eror: "+JSON.stringify(err));
 });
}

async function seedPlans(){

//name, price  maxUsers
const plans = [
  {
  name: 'Plus',
  price:500,
  maxUsers:1
},
{
  name: 'Choice  Plus',
  price:1300,
  maxUsers:3
},
{
  name: 'Business Plus',
  price:2000,
  maxUsers:5
},
{
  name: 'Custom',
  price:-1,
  maxUsers:-1
}
];
  
  PlansModel.bulkCreate(plans)
.then(data => {
 console.log("Plans Created: "+JSON.stringify(data));
})
.catch(err => {
  console.log("Plan Creation eror: "+JSON.stringify(err));
});
}

function hashPassword(password) {
    let salt = makeSalt();
    return {hashed_password:encryptPassword(password, salt), salt:salt};

  };


function encryptPassword(password, salt) {

    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1',salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  };

  function makeSalt() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  }

  seedAdmin();
  seedPlans();