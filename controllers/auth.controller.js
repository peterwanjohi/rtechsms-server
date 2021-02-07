const crypto = require('crypto');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/dbErrorHandling');
const db = require("../models");
const UserModel = db.auth;
const OrganizationModel = db.organization;
const Op = db.Sequelize.Op;
const mail = require("../services/mail");
const {calculateNextPayment} = require("../helpers/Helper");

exports.registerController = async (req, res) => {
  const { organizationname, firstname,lastname, email,phone, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {

    const organization = await OrganizationModel.findOne({where: {
      name:organizationname
    }});
    if (organization) {
      return res.status(400).json({
        errors: 'oops!!.This organization name is already taken.'
      });
    };


    const user = await UserModel.findOne({ where: { email: email } });
  if (user) {
    return res.status(400).json({
      errors: 'A user with that email already exist.'
    });
  };

  let hashed_passwordObj = hashPassword(password);
    let newUser ={
      firstname: firstname,
      lastname: lastname,
      organization:organizationname,
      email:email,
      phone: phone,
      hashed_password: hashed_passwordObj.hashed_password,
      salt: hashed_passwordObj.salt,
      isActive: false,
      role: 'admin'
  };
   UserModel.create(newUser)
   .then(() => {
    const token = jwt.sign(
      {
        email,
        organizationname
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: '1h'
      }
    );

    mail.sendRegistrationMailMail(res, process.env.FROM, email,"Account activation","Account activation link.",`${process.env.CLIENT_URL}/activate/${token}`,`Hello ${firstname}. We're excited to have you on board. First, you need to verify your account`,"Activate Account","We're thrilled to have you here! Get ready to dive into your new account.");

          return res.json({
            message: `A verification email has been sent to ${email}`
          });
  
      })
  .catch(err => {
 return res.status(400).json({
            success: false,
            errors:"Failed to create account. Please try again later."
          });  });
    

  }
}

exports.registerUserController = (req, res) => {
  const { firstname,lastname, email,phone} = req.body;
  const organization = req.user.organization;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
 
    UserModel.findOne({where: {
      email:email
    }}).then((existinguser) => { 
     if (existinguser) {
        return res.status(400).json({
          errors: 'Email is taken'
        });
      }
  
    let password = makePassword(6);
    let hashed_passwordObj = hashPassword(password);

    let user = {
      firstname: firstname,
      lastname: lastname,
      organization:organization,
      email:email,
      phone: phone,
      hashed_password: hashed_passwordObj.hashed_password,
      salt: hashed_passwordObj.salt,
      isActive: true,
      role: 'user'
  };

    UserModel.create(user).then( user=>{
  
      mail.sendMail(res,process.env.FROM, email,'Temporaly password.', `Hello ${user.firstname}, Welcome Onboard!.`, `Your new account has been created. The following password has been generated by Rtech SMS system. Use it to login to your account and update it </p>
      <p>Password: <strong>${password}</strong></p>`,"New Rtech SMS account.");
        return res.json({
          message: `User created successfuly. A password has been sent to their email.`
        });
     
     
    })

    .catch(err=>{
       return res.status(400).json({
        success: false,
        errors: errorHandler(err)
      });
    })
      });
   
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION,async(err, decoded) => {
      if (err) {
        console.log('Activation error');
        return res.status(401).json({
          errors: 'Expired link. Signup again'
        });
      } else {
        const {organizationname, email} = jwt.decode(token);
        let date = Date.now();
        nextpaymentDate = await calculateNextPayment(date, 14);
        const org = {
         name:organizationname,
         units:2,
         sent_messages:0,
         users:1,
         is_paid:false,
         plan:null,
         senderId:null,
         plan:"Free Trial",
         next_payment_date: nextpaymentDate
        };

       await OrganizationModel.findOne({where: {name: organizationname}})
       .then(organization=>{
         if(!organization){
          OrganizationModel.create(org).then(organ=>{
            console.log("Saved org")
          }).catch(err=>{
            console.log("Error saving org: "+err)
          });
         }
       })

         UserModel.findOne({where: {email: email}})
          .then( function (user) {
    // Check if record exists in db
    if (user) {
      if(user.isActive){
        return res.status(400).json({
          errors: 'Your account is already active!'
        });
      }
      
      user.update({
        isActive: true
      })
      .then(function () {
        mail.sendMail(res,process.env.FROM, email,'Temporaly password.', `Hello ${user.firstname}, Welcome Onboard!.`, `Your new account has been succesfully activated. Thank you for choosing Rtech Sms.</p>
      `," Rtech SMS account activated.");
            return res.json({
                  success: true,
                  message: user,
                  message: 'Activated successfully'
                });
      })
      .catch(err =>{
        return res.status(400).json({
          errors: "Unable to activate account"
        });
      }
      )
      
    }
  })
     
        
      }
    });
  } else {
    return res.json({
      message: 'There is no activation token!!'
    });
  }
};

exports.signinController = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } 

   UserModel.findOne({where:{ email:email } }).then(async (user) => {
      if (!user) {
        return res.status(400).json({
          errors: 'User with that email does not exist. Please signup'
        });
      }
      if(!user.isActive){
        return res.status(400).json({
          errors: 'Your account is not activated. Kindly follow the link sent to your mail to activate!'
        });
      }
      // authenticate
      let salt = user.salt;
      let hashed_password = user.hashed_password;
      if (!authenticate(password, salt, hashed_password)) {
        return res.status(400).json({
          errors: 'Email and password do not match'
        });
      }

      // generate a token and send to client
      const token = jwt.sign(
        {
          id: user.id, organization: user.organization,role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        }
      );
      const last_login = new Date();

      await user.update({last_login:last_login});

      const { id,organization, firstname, lastname, email, phone, role } = user;
      return res.json({
        token,
        user: {
          id,
          organization,
          firstname,
          lastname,
          email,
          phone,
          role
        }
      });
    });
  
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET
});

exports.adminMiddleware = (req, res, next) => {
  UserModel.findByPk(req.user.id).then((user) => {
    if (!user) {
      return res.status(400).json({
        error: 'Admin not found'
      });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(400).json({
        error: 'Access denied.'
      });
    }
    req.profile = user;
    next();
  });
};
exports.superAdminMiddleware = (req, res, next) => {
  UserModel.findByPk(req.user.id).then((user) => {
    if (!user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (user.role !== 'superadmin') {
      return res.status(400).json({
        error: 'Access denied.'
      });
    }
    req.profile = user;
    next();
  });
};

exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    UserModel.findOne(
   {where:   {
    email
  }})
      .then( user => {
        if ( !user) {
          return res.status(400).json({
            error: 'User with that email does not exist'
          });
        }

        const token = jwt.sign(
          {
            id: user.id
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: '1hr'
          }
        );

   

        return user.update(
          {
            resetPasswordLink: token
          }).then(() => {
            mail.sendRegistrationMailMail(res, process.env.FROM, email,"Password Reset","Password Reset link.",`${process.env.CLIENT_URL}/reset-password/${token}`,`Hello ${user.firstname}. You have requested to reset your password.`,"Reset Password","Password reset link.");
            return res.json({
              message: `An email has been sent to ${email}. Follow the instruction to reset your password.`
            });
      
            })
            .catch(err=>{
              console.log('Reset pass  EMAIL SENT ERROR', err);
              return res.json({
                message: err.message
              });
            
          })
          }
        );
      }
};

exports.resetPasswordController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } 
  else {
    if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(
        err,
        decoded
      ) {
        if (err) {
          return res.status(400).json({
            error: 'Expired link. Try again'
          });
        }
       


        UserModel.findOne({where: {
          resetPasswordLink
        }})
         .then( user => {
            if (!user) {
              return res.status(400).json({
                error: 'Error resseting password. Try later'
              });
            }
            let hashed_passwordObj = hashPassword(newPassword);
            

            user.update({
              hashed_password: hashed_passwordObj.hashed_password,
              salt: hashed_passwordObj.salt,
              resetPasswordLink: ''
            }).then((result) => {
            
              res.json({
                message: `Great! Now you can login with your new password`
              });
            }).catch(er =>{
              return res.status(400).json({
                error: 'Error resetting user password'
              });
            });
        
      });
    });
    }
  }
};

exports.changePasswordController = (req, res) => {
  
  const {newPassword } = req.body;
  if (!newPassword) {
    return res.status(422).json({
      errors: "New password must not be empty."
    });
  } 
  else {
  
        UserModel.findByPk(req.user.id)
         .then( user => {
            if (!user) {
              return res.status(400).json({
                error: 'Error changing password. Try later'
              });
            }
            let hashed_passwordObj = hashPassword(newPassword);
            

            user.update({
              hashed_password: hashed_passwordObj.hashed_password,
              salt: hashed_passwordObj.salt,
              resetPasswordLink: ''
            }).then(() => {
            
              res.json({
                message: ` Your password has been changed.`
              });
            }).catch(er =>{
              return res.status(400).json({
                error: 'Error changing password'
              });
            });
        
      });
    
    }
  
};
exports.testMail = (req, res)=>{
  //from,to,subject,h1, message
  //res,from,to,subject,h1,link
  mail.sendRegistrationMailMail(res, process.env.FROM, 'peterwanjohi143@gmail.com',"Testing","This is a test mail.",process.env.CLIENT_URL,"We're excited to have you on board. First, you need to verify your account","Reset Password","We're thrilled to have you here! Get ready to dive into your new account.");
}
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT,process.env.GOOGLE_SECRET);
// Google Login
// exports.googleController = (req, res) => {
//   const { idToken } = req.body;

//   client
//     .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
//     .then(response => {
//       // console.log('GOOGLE LOGIN RESPONSE',response)
//       const { email_verified, name, email } = response.payload;
//       if (email_verified) {
//         Admin.findOne({ email }).exec((err, user) => {
//           if (user) {
//             const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//               expiresIn: '7d'
//             });
//             const { _id, organizationname,  email, name, phone, role } = user;
//             return res.json({
//               token,
//               user: { _id, organizationname, email, phone, name, role }
//             });
//           } else {
//             let password = email + process.env.JWT_SECRET;
//             user = new Admin({  name, email, password });
//             user.save((err, data) => {
//               if (err) {
//                 console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
//                 return res.status(400).json({
//                   error: 'Admin signup failed with google'
//                 });
//               }
//               const token = jwt.sign(
//                 { _id: data._id },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '7d' }
//               );
//               const { _id, email, name, role } = data;
//               return res.json({
//                 token,
//                 user: { _id, email, name, role }
//               });
//             });
//           }
//         });
//       } else {
//         return res.status(400).json({
//           error: 'Google login failed. Try again'
//         });
//       }
//     });
// };

// exports.facebookController = (req, res) => {
//   console.log('FACEBOOK LOGIN REQ BODY', req.body);
//   const { userID, accessToken } = req.body;

//   const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

//   return (
//     fetch(url, {
//       method: 'GET'
//     })
//       .then(response => response.json())
//       // .then(response => console.log(response))
//       .then(response => {
//         const { email, name } = response;
//         Admin.findOne({ email }).exec((err, user) => {
//           if (user) {
//             const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//               expiresIn: '7d'
//             });
//             const { _id, email, name, role } = user;
//             return res.json({
//               token,
//               user: { _id, email, name, role }
//             });
//           } else {
//             let password = email + process.env.JWT_SECRET;
//             user = new Admin({ name, email, password });
//             user.save((err, data) => {
//               if (err) {
//                 console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
//                 return res.status(400).json({
//                   error: 'Admin signup failed with facebook'
//                 });
//               }
//               const token = jwt.sign(
//                 { _id: data._id },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '7d' }
//               );
//               const { _id, email, name, role } = data;
//               return res.json({
//                 token,
//                 user: { _id, email, name, role }
//               });
//             });
//           }
//         });
//       })
//       .catch(error => {
//         res.json({
//           error: 'Facebook login failed. Try later'
//         });
//       })
//   );
// };

function authenticate(plainText, salt, hashed_password) {
  return encryptPassword(plainText, salt) === hashed_password;
};


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

function makePassword(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};