// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Cart = sequelize.define('Cart', {
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
//   foodItemId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'food_items',
//       key: 'id'
//     }
//   },
//   quantity: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 1,
//     validate: {
//       min: 1
//     }
//   },
//   unitPrice: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   specialInstructions: {
//     type: DataTypes.TEXT
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   }
// }, {
//   tableName: 'carts',
//   indexes: [
//     {
//       fields: ['user_id']
//     },
//     {
//       fields: ['food_item_id']
//     },
//     {
//       unique: true,
//       fields: ['user_id', 'food_item_id']
//     }
//   ]
// });

// module.exports = Cart; 


const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
