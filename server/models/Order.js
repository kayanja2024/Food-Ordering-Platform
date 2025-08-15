// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Order = sequelize.define('Order', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   orderNumber: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//     unique: true
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
//     defaultValue: 'pending'
//   },
//   totalAmount: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   subtotal: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   taxAmount: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0
//   },
//   deliveryFee: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0
//   },
//   discountAmount: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0
//   },
//   paymentMethod: {
//     type: DataTypes.ENUM('airtel_money', 'mtn_mobile_money', 'cash'),
//     allowNull: false
//   },
//   paymentStatus: {
//     type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
//     defaultValue: 'pending'
//   },
//   paymentTransactionId: {
//     type: DataTypes.STRING(100)
//   },
//   deliveryAddress: {
//     type: DataTypes.JSON,
//     allowNull: false
//   },
//   deliveryInstructions: {
//     type: DataTypes.TEXT
//   },
//   estimatedDeliveryTime: {
//     type: DataTypes.DATE
//   },
//   actualDeliveryTime: {
//     type: DataTypes.DATE
//   },
//   customerNotes: {
//     type: DataTypes.TEXT
//   },
//   adminNotes: {
//     type: DataTypes.TEXT
//   },
//   isUrgent: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   tableName: 'orders',
//   hooks: {
//     beforeCreate: (order) => {
//       if (!order.orderNumber) {
//         order.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
//       }
//     }
//   },
//   indexes: [
//     {
//       fields: ['user_id']
//     },
//     {
//       fields: ['status']
//     },
//     {
//       fields: ['payment_status']
//     },
//     {
//       fields: ['order_number']
//     }
//   ]
// });

// module.exports = Order; 



const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
