// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Address = sequelize.define('Address', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   label: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   firstName: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   lastName: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   phone: {
//     type: DataTypes.STRING(20),
//     allowNull: false
//   },
//   street: {
//     type: DataTypes.STRING(255),
//     allowNull: false
//   },
//   city: {
//     type: DataTypes.STRING(100),
//     allowNull: false
//   },
//   state: {
//     type: DataTypes.STRING(100)
//   },
//   postalCode: {
//     type: DataTypes.STRING(20)
//   },
//   country: {
//     type: DataTypes.STRING(100),
//     defaultValue: 'Uganda'
//   },
//   latitude: {
//     type: DataTypes.DECIMAL(10, 8)
//   },
//   longitude: {
//     type: DataTypes.DECIMAL(11, 8)
//   },
//   isDefault: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
//   additionalInfo: {
//     type: DataTypes.TEXT
//   }
// }, {
//   tableName: 'addresses',
//   indexes: [
//     {
//       fields: ['user_id']
//     },
//     {
//       fields: ['is_default']
//     }
//   ]
// });

// module.exports = Address; 





const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
