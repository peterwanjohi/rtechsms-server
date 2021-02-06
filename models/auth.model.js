module.exports = (sequelize, Sequelize) => {
  const adminSchema = sequelize.define("user", {
    organization: {
      type: Sequelize.STRING,
      allowNull: false,
      
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hashed_password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    avatar: {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    },
    resetPasswordLink: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    verificationCode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive:{
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return adminSchema;
};
// // admin schema
// const adminSchema = new mongoose.Schema(
//   {
   
//     organization: {
//       type: String,
//       trim: true,
//       required: true,
//       lowercase: true,
//     },
//     name: {
//       type: String,
//       trim: true,
//       required: true
//     },
//     email: {
//       type: String,
//       trim: true,
//       required: true,
//       unique: true,
//       lowercase: true
//     },
//     phone: {
//       type: String,
//       trim: true,
//       required: true,
//       lowercase: true,
//       default:'no phone'
//     },
    
//     hashed_password: {
//       type: String,
//       required: true
//     },
//     salt: String,
//     role: {
//       type: String,
//       default: 'admin'
//     },
//     resetPasswordLink: {
//       data: String,
//       default: ''
//     },
//     avatar:{
//       type:String,
//       default:''
//     }
//     },
//     {
//       timestamps: true
//     }
// );

// virtual
// adminSchema
//   .virtual('password')
//   .set(function(password) {
//     this._password = password;
//     this.salt = this.makeSalt();
//     this.hashed_password = this.encryptPassword(password);
//   })
//   .get(function() {
//     return this._password;
//   });

// // methods
// adminSchema.methods = {
  // authenticate: function(plainText) {
  //   return this.encryptPassword(plainText) === this.hashed_password;
  // },

//   encryptPassword: function(password) {
//     if (!password) return '';
//     try {
//       return crypto
//         .createHmac('sha1', this.salt)
//         .update(password)
//         .digest('hex');
//     } catch (err) {
//       return '';
//     }
//   },

//   makeSalt: function() {
//     return Math.round(new Date().valueOf() * Math.random()) + '';
//   }
// };

// module.exports = mongoose.model('Admin', adminSchema);
