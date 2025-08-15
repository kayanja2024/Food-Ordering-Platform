// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const { Order, OrderItem, Cart, FoodItem, User, Address } = require('../models');
// const { auth } = require('../middleware/auth');
// const paymentService = require('../services/paymentService');
// const { sendOrderConfirmation, sendDeliveryUpdate } = require('../services/notificationService');

// const router = express.Router();

// // Place order
// router.post('/place', [
//   auth,
//   body('deliveryAddress').isObject(),
//   body('deliveryAddress.street').notEmpty(),
//   body('deliveryAddress.city').notEmpty(),
//   body('deliveryAddress.phone').notEmpty(),
//   body('paymentMethod').isIn(['airtel_money', 'mtn_mobile_money', 'cash']),
//   body('deliveryInstructions').optional().isString(),
//   body('customerNotes').optional().isString()
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       deliveryAddress,
//       paymentMethod,
//       deliveryInstructions,
//       customerNotes
//     } = req.body;

//     // Get user's cart
//     const cartItems = await Cart.findAll({
//       where: {
//         userId: req.user.id,
//         isActive: true
//       },
//       include: [{
//         model: FoodItem,
//         as: 'foodItem',
//         attributes: ['id', 'name', 'price', 'image', 'isAvailable']
//       }]
//     });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ error: 'Cart is empty' });
//     }

//     // Validate cart items
//     const validItems = [];
//     let subtotal = 0;

//     for (const item of cartItems) {
//       if (!item.foodItem || !item.foodItem.isAvailable) {
//         return res.status(400).json({ 
//           error: `Item "${item.foodItem?.name || 'Unknown'}" is no longer available` 
//         });
//       }
      
//       validItems.push({
//         foodItemId: item.foodItemId,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         totalPrice: item.unitPrice * item.quantity,
//         specialInstructions: item.specialInstructions,
//         itemName: item.foodItem.name,
//         itemImage: item.foodItem.image
//       });
      
//       subtotal += item.unitPrice * item.quantity;
//     }

//     // Calculate totals
//     const deliveryFee = paymentService.calculateDeliveryFee(0); // Distance calculation would be implemented
//     const taxAmount = paymentService.calculateTax(subtotal);
//     const totalAmount = paymentService.calculateTotal(subtotal, deliveryFee);

//     // Create order
//     const order = await Order.create({
//       userId: req.user.id,
//       status: 'pending',
//       totalAmount,
//       subtotal,
//       taxAmount,
//       deliveryFee,
//       paymentMethod,
//       paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
//       deliveryAddress,
//       deliveryInstructions,
//       customerNotes,
//       estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
//     });

//     // Create order items
//     const orderItems = await OrderItem.bulkCreate(
//       validItems.map(item => ({
//         orderId: order.id,
//         ...item
//       }))
//     );

//     // Clear cart
//     await Cart.update(
//       { isActive: false },
//       { where: { userId: req.user.id, isActive: true } }
//     );

//     // Send order confirmation
//     await sendOrderConfirmation(req.user, order);

//     res.status(201).json({
//       message: 'Order placed successfully',
//       order: {
//         ...order.toJSON(),
//         orderItems
//       }
//     });
//   } catch (error) {
//     console.error('Place order error:', error);
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// });

// // Get user's orders
// router.get('/', auth, async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = { userId: req.user.id };
//     if (status) {
//       whereClause.status = status;
//     }

//     const orders = await Order.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: OrderItem,
//         as: 'orderItems',
//         attributes: ['id', 'itemName', 'quantity', 'unitPrice', 'totalPrice']
//       }],
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       orders: orders.rows,
//       totalOrders: orders.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(orders.count / limit)
//     });
//   } catch (error) {
//     console.error('Get orders error:', error);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// });

// // Get single order
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findOne({
//       where: {
//         id,
//         userId: req.user.id
//       },
//       include: [{
//         model: OrderItem,
//         as: 'orderItems',
//         attributes: ['id', 'itemName', 'quantity', 'unitPrice', 'totalPrice', 'specialInstructions', 'itemImage']
//       }]
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json({ order });
//   } catch (error) {
//     console.error('Get order error:', error);
//     res.status(500).json({ error: 'Failed to fetch order' });
//   }
// });

// // Cancel order
// router.post('/:id/cancel', auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findOne({
//       where: {
//         id,
//         userId: req.user.id
//       }
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Check if order can be cancelled
//     const cancellableStatuses = ['pending', 'confirmed'];
//     if (!cancellableStatuses.includes(order.status)) {
//       return res.status(400).json({ 
//         error: `Order cannot be cancelled in ${order.status} status` 
//       });
//     }

//     // Update order status
//     order.status = 'cancelled';
//     await order.save();

//     // Send notification
//     await sendDeliveryUpdate(req.user, order, 'cancelled');

//     res.json({
//       message: 'Order cancelled successfully',
//       order
//     });
//   } catch (error) {
//     console.error('Cancel order error:', error);
//     res.status(500).json({ error: 'Failed to cancel order' });
//   }
// });

// // Track order
// router.get('/:id/track', auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findOne({
//       where: {
//         id,
//         userId: req.user.id
//       },
//       attributes: ['id', 'orderNumber', 'status', 'createdAt', 'estimatedDeliveryTime', 'actualDeliveryTime']
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Define status timeline
//     const statusTimeline = {
//       pending: { step: 1, label: 'Order Placed', description: 'Your order has been received' },
//       confirmed: { step: 2, label: 'Order Confirmed', description: 'Your order has been confirmed' },
//       preparing: { step: 3, label: 'Preparing', description: 'Your food is being prepared' },
//       ready: { step: 4, label: 'Ready', description: 'Your order is ready for delivery' },
//       out_for_delivery: { step: 5, label: 'Out for Delivery', description: 'Your order is on the way' },
//       delivered: { step: 6, label: 'Delivered', description: 'Your order has been delivered' },
//       cancelled: { step: 0, label: 'Cancelled', description: 'Your order has been cancelled' }
//     };

//     const currentStatus = statusTimeline[order.status];
//     const timeline = Object.entries(statusTimeline)
//       .filter(([key]) => key !== 'cancelled')
//       .map(([key, value]) => ({
//         ...value,
//         isCompleted: currentStatus.step >= value.step,
//         isCurrent: key === order.status
//       }));

//     res.json({
//       order,
//       timeline,
//       currentStatus
//     });
//   } catch (error) {
//     console.error('Track order error:', error);
//     res.status(500).json({ error: 'Failed to track order' });
//   }
// });

// // Get order statistics
// router.get('/stats/summary', auth, async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       where: { userId: req.user.id },
//       attributes: ['status', 'totalAmount', 'createdAt']
//     });

//     const stats = {
//       totalOrders: orders.length,
//       totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
//       statusCounts: {},
//       recentOrders: orders
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .slice(0, 5)
//     };

//     // Count orders by status
//     orders.forEach(order => {
//       stats.statusCounts[order.status] = (stats.statusCounts[order.status] || 0) + 1;
//     });

//     res.json(stats);
//   } catch (error) {
//     console.error('Get order stats error:', error);
//     res.status(500).json({ error: 'Failed to fetch order statistics' });
//   }
// });

// // Reorder
// router.post('/:id/reorder', auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const originalOrder = await Order.findOne({
//       where: {
//         id,
//         userId: req.user.id
//       },
//       include: [{
//         model: OrderItem,
//         as: 'orderItems'
//       }]
//     });

//     if (!originalOrder) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Clear current cart
//     await Cart.update(
//       { isActive: false },
//       { where: { userId: req.user.id, isActive: true } }
//     );

//     // Add items to cart
//     const cartItems = [];
//     for (const item of originalOrder.orderItems) {
//       const foodItem = await FoodItem.findByPk(item.foodItemId);
//       if (foodItem && foodItem.isAvailable) {
//         const cartItem = await Cart.create({
//           userId: req.user.id,
//           foodItemId: item.foodItemId,
//           quantity: item.quantity,
//           unitPrice: foodItem.price,
//           specialInstructions: item.specialInstructions
//         });
//         cartItems.push(cartItem);
//       }
//     }

//     res.json({
//       message: 'Items added to cart for reorder',
//       cartItems
//     });
//   } catch (error) {
//     console.error('Reorder error:', error);
//     res.status(500).json({ error: 'Failed to reorder' });
//   }
// });

// module.exports = router; 










// const express = require('express');
// const router = express.Router();
// const { Order, OrderItem } = require('../models');

// // Get all orders with user info
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find().populate('userId', '-password');
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get single order with order items & food details
// router.get('/:id', async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('userId', '-password');

//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     const items = await OrderItem.find({ orderId: order._id })
//       .populate('foodItemId');

//     res.json({ ...order.toObject(), items });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;







const express = require('express');
const router = express.Router();
const { Order, OrderItem } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Get all orders for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('userId', '-password');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newOrder = await Order.create({
      userId: req.user._id,
      totalAmount: req.body.totalAmount,
      status: 'pending'
    });
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

