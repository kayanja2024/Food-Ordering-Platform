// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const OrderItem = sequelize.define('OrderItem', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   orderId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'orders',
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
//     validate: {
//       min: 1
//     }
//   },
//   unitPrice: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   totalPrice: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   specialInstructions: {
//     type: DataTypes.TEXT
//   },
//   itemName: {
//     type: DataTypes.STRING(200),
//     allowNull: false
//   },
//   itemImage: {
//     type: DataTypes.STRING(500)
//   }
// }, {
//   tableName: 'order_items',
//   hooks: {
//     beforeCreate: (orderItem) => {
//       if (!orderItem.totalPrice) {
//         orderItem.totalPrice = orderItem.unitPrice * orderItem.quantity;
//       }
//     },
//     beforeUpdate: (orderItem) => {
//       if (orderItem.changed('unitPrice') || orderItem.changed('quantity')) {
//         orderItem.totalPrice = orderItem.unitPrice * orderItem.quantity;
//       }
//     }
//   },
//   indexes: [
//     {
//       fields: ['order_id']
//     },
//     {
//       fields: ['food_item_id']
//     }
//   ]
// });

// module.exports = OrderItem; 



const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
