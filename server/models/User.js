// // const { DataTypes } = require('sequelize');
// const bcrypt = require('bcryptjs');
// // const { sequelize } = require('../config/database');

// const User = mongoose.define('User', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   email: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true
//     }
//   },
//   phone: {
//     type: DataTypes.STRING(20),
//     allowNull: false,
//     unique: true,
//     validate: {
//       is: /^\+?[1-9]\d{1,14}$/
//     }
//   },
//   password: {
//     type: DataTypes.STRING(255),
//     allowNull: true // Allow null for OTP-only users
//   },
//   firstName: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   lastName: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   role: {
//     type: DataTypes.ENUM('customer', 'admin'),
//     defaultValue: 'customer'
//   },
//   isVerified: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
//   lastLogin: {
//     type: DataTypes.DATE
//   },
//   profileImage: {
//     type: DataTypes.STRING(500)
//   },
//   preferences: {
//     type: DataTypes.JSON,
//     defaultValue: {}
//   }
// }, {
//   tableName: 'users',
//   hooks: {
//     beforeCreate: async (user) => {
//       if (user.password) {
//         user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
//       }
//     },
//     beforeUpdate: async (user) => {
//       if (user.changed('password')) {
//         user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
//       }
//     }
//   }
// });

// // Instance methods
// User.prototype.comparePassword = async function(candidatePassword) {
//   if (!this.password) return false;
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// User.prototype.toJSON = function() {
//   const values = Object.assign({}, this.get());
//   delete values.password;
//   return values;
// };

// module.exports = User; 




const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    default: null // Allow null for OTP-only users
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    maxlength: 500
  },
  preferences: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Password hashing before save
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password when returning JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
