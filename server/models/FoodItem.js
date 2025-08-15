// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const FoodItem = sequelize.define('FoodItem', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: {
//     type: DataTypes.STRING(200),
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.TEXT
//   },
//   price: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false,
//     validate: {
//       min: 0
//     }
//   },
//   originalPrice: {
//     type: DataTypes.DECIMAL(10, 2),
//     validate: {
//       min: 0
//     }
//   },
//   image: {
//     type: DataTypes.STRING(500)
//   },
//   images: {
//     type: DataTypes.JSON,
//     defaultValue: []
//   },
//   categoryId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'categories',
//       key: 'id'
//     }
//   },
//   isAvailable: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
//   isFeatured: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   preparationTime: {
//     type: DataTypes.INTEGER, // in minutes
//     defaultValue: 30
//   },
//   calories: {
//     type: DataTypes.INTEGER
//   },
//   allergens: {
//     type: DataTypes.JSON,
//     defaultValue: []
//   },
//   ingredients: {
//     type: DataTypes.JSON,
//     defaultValue: []
//   },
//   nutritionalInfo: {
//     type: DataTypes.JSON,
//     defaultValue: {}
//   },
//   tags: {
//     type: DataTypes.JSON,
//     defaultValue: []
//   },
//   sortOrder: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   tableName: 'food_items',
//   indexes: [
//     {
//       fields: ['category_id']
//     },
//     {
//       fields: ['is_available']
//     },
//     {
//       fields: ['is_featured']
//     }
//   ]
// });

// module.exports = FoodItem; 


const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', foodItemSchema);
