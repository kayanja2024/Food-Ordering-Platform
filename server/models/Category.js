// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Category = sequelize.define('Category', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//     unique: true
//   },
//   description: {
//     type: DataTypes.TEXT
//   },
//   image: {
//     type: DataTypes.STRING(500)
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
//   sortOrder: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   tableName: 'categories'
// });

// module.exports = Category; 



// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   description: { type: String }
// }, { timestamps: true });

// module.exports = mongoose.model('Category', categorySchema);







const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', CategorySchema);
