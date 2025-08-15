// const User = require('./User');
// const Category = require('./Category');
// const FoodItem = require('./FoodItem');
// const Order = require('./Order');
// const OrderItem = require('./OrderItem');
// const Cart = require('./Cart');
// const Address = require('./Address');

// // User associations
// User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
// User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
// User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });

// // Category associations
// Category.hasMany(FoodItem, { foreignKey: 'categoryId', as: 'foodItems' });

// // FoodItem associations
// FoodItem.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
// FoodItem.hasMany(Cart, { foreignKey: 'foodItemId', as: 'cartItems' });
// FoodItem.hasMany(OrderItem, { foreignKey: 'foodItemId', as: 'orderItems' });

// // Order associations
// Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });

// // OrderItem associations
// OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
// OrderItem.belongsTo(FoodItem, { foreignKey: 'foodItemId', as: 'foodItem' });

// // Cart associations
// Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// Cart.belongsTo(FoodItem, { foreignKey: 'foodItemId', as: 'foodItem' });

// // Address associations
// Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// module.exports = {
//   User,
//   Category,
//   FoodItem,
//   Order,
//   OrderItem,
//   Cart,
//   Address
// }; 



const User = require('./User');
const Category = require('./Category');
const FoodItem = require('./FoodItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const Address = require('./Address');

module.exports = {
  User,
  Category,
  FoodItem,
  Order,
  OrderItem,
  Cart,
  Address
};
