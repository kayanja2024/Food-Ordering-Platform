// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const { Cart, FoodItem } = require('../models');
// const { auth } = require('../middleware/auth');

// const router = express.Router();

// // Get user's cart
// router.get('/', auth, async (req, res) => {
//   try {
//     const cartItems = await Cart.findAll({
//       where: {
//         userId: req.user.id,
//         isActive: true
//       },
//       include: [{
//         model: FoodItem,
//         as: 'foodItem',
//         attributes: ['id', 'name', 'price', 'image', 'isAvailable']
//       }],
//       order: [['createdAt', 'DESC']]
//     });

//     // Calculate totals
//     let subtotal = 0;
//     const validItems = cartItems.filter(item => {
//       if (!item.foodItem || !item.foodItem.isAvailable) {
//         return false;
//       }
//       subtotal += item.unitPrice * item.quantity;
//       return true;
//     });

//     res.json({
//       cartItems: validItems,
//       subtotal,
//       itemCount: validItems.length
//     });
//   } catch (error) {
//     console.error('Get cart error:', error);
//     res.status(500).json({ error: 'Failed to fetch cart' });
//   }
// });

// // Add item to cart
// router.post('/add', [
//   auth,
//   body('foodItemId').isInt({ min: 1 }),
//   body('quantity').isInt({ min: 1, max: 99 }),
//   body('specialInstructions').optional().isString().isLength({ max: 500 })
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { foodItemId, quantity, specialInstructions } = req.body;

//     // Check if food item exists and is available
//     const foodItem = await FoodItem.findOne({
//       where: {
//         id: foodItemId,
//         isAvailable: true
//       }
//     });

//     if (!foodItem) {
//       return res.status(404).json({ error: 'Food item not found or unavailable' });
//     }

//     // Check if item already exists in cart
//     const existingCartItem = await Cart.findOne({
//       where: {
//         userId: req.user.id,
//         foodItemId,
//         isActive: true
//       }
//     });

//     if (existingCartItem) {
//       // Update existing item
//       existingCartItem.quantity += quantity;
//       if (specialInstructions) {
//         existingCartItem.specialInstructions = specialInstructions;
//       }
//       await existingCartItem.save();

//       res.json({
//         message: 'Cart item updated successfully',
//         cartItem: existingCartItem
//       });
//     } else {
//       // Create new cart item
//       const cartItem = await Cart.create({
//         userId: req.user.id,
//         foodItemId,
//         quantity,
//         unitPrice: foodItem.price,
//         specialInstructions
//       });

//       res.status(201).json({
//         message: 'Item added to cart successfully',
//         cartItem
//       });
//     }
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     res.status(500).json({ error: 'Failed to add item to cart' });
//   }
// });

// // Update cart item
// router.put('/update/:id', [
//   auth,
//   body('quantity').isInt({ min: 1, max: 99 }),
//   body('specialInstructions').optional().isString().isLength({ max: 500 })
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { id } = req.params;
//     const { quantity, specialInstructions } = req.body;

//     const cartItem = await Cart.findOne({
//       where: {
//         id,
//         userId: req.user.id,
//         isActive: true
//       }
//     });

//     if (!cartItem) {
//       return res.status(404).json({ error: 'Cart item not found' });
//     }

//     // Check if food item is still available
//     const foodItem = await FoodItem.findByPk(cartItem.foodItemId);
//     if (!foodItem || !foodItem.isAvailable) {
//       return res.status(400).json({ error: 'Food item is no longer available' });
//     }

//     // Update cart item
//     cartItem.quantity = quantity;
//     cartItem.unitPrice = foodItem.price; // Update price in case it changed
//     if (specialInstructions !== undefined) {
//       cartItem.specialInstructions = specialInstructions;
//     }
//     await cartItem.save();

//     res.json({
//       message: 'Cart item updated successfully',
//       cartItem
//     });
//   } catch (error) {
//     console.error('Update cart item error:', error);
//     res.status(500).json({ error: 'Failed to update cart item' });
//   }
// });

// // Remove item from cart
// router.delete('/remove/:id', auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const cartItem = await Cart.findOne({
//       where: {
//         id,
//         userId: req.user.id,
//         isActive: true
//       }
//     });

//     if (!cartItem) {
//       return res.status(404).json({ error: 'Cart item not found' });
//     }

//     // Soft delete by setting isActive to false
//     cartItem.isActive = false;
//     await cartItem.save();

//     res.json({ message: 'Item removed from cart successfully' });
//   } catch (error) {
//     console.error('Remove cart item error:', error);
//     res.status(500).json({ error: 'Failed to remove item from cart' });
//   }
// });

// // Clear cart
// router.delete('/clear', auth, async (req, res) => {
//   try {
//     await Cart.update(
//       { isActive: false },
//       {
//         where: {
//           userId: req.user.id,
//           isActive: true
//         }
//       }
//     );

//     res.json({ message: 'Cart cleared successfully' });
//   } catch (error) {
//     console.error('Clear cart error:', error);
//     res.status(500).json({ error: 'Failed to clear cart' });
//   }
// });

// // Get cart summary
// router.get('/summary', auth, async (req, res) => {
//   try {
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

//     let subtotal = 0;
//     let itemCount = 0;
//     const validItems = [];

//     cartItems.forEach(item => {
//       if (item.foodItem && item.foodItem.isAvailable) {
//         subtotal += item.unitPrice * item.quantity;
//         itemCount += item.quantity;
//         validItems.push(item);
//       }
//     });

//     res.json({
//       itemCount,
//       subtotal,
//       validItems: validItems.length
//     });
//   } catch (error) {
//     console.error('Get cart summary error:', error);
//     res.status(500).json({ error: 'Failed to get cart summary' });
//   }
// });

// // Validate cart items
// router.get('/validate', auth, async (req, res) => {
//   try {
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

//     const validationResults = {
//       valid: [],
//       invalid: [],
//       unavailable: []
//     };

//     cartItems.forEach(item => {
//       if (!item.foodItem) {
//         validationResults.invalid.push({
//           cartItemId: item.id,
//           reason: 'Food item not found'
//         });
//       } else if (!item.foodItem.isAvailable) {
//         validationResults.unavailable.push({
//           cartItemId: item.id,
//           foodItemId: item.foodItem.id,
//           name: item.foodItem.name,
//           reason: 'Food item is unavailable'
//         });
//       } else {
//         validationResults.valid.push({
//           cartItemId: item.id,
//           foodItemId: item.foodItem.id,
//           name: item.foodItem.name,
//           price: item.unitPrice,
//           quantity: item.quantity
//         });
//       }
//     });

//     res.json(validationResults);
//   } catch (error) {
//     console.error('Validate cart error:', error);
//     res.status(500).json({ error: 'Failed to validate cart' });
//   }
// });

// module.exports = router; 










// const express = require('express');
// const router = express.Router();
// const { Cart } = require('../models');

// // Get cart for a user with food item details
// router.get('/:userId', async (req, res) => {
//   try {
//     const cartItems = await Cart.find({ userId: req.params.userId })
//       .populate('foodItemId');
//     res.json(cartItems);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add item to cart
// router.post('/', async (req, res) => {
//   try {
//     const cartItem = await Cart.create(req.body);
//     res.status(201).json(cartItem);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;









const express = require('express');
const router = express.Router();
const { Cart } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Get logged-in user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id })
      .populate('foodItemId');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newCartItem = await Cart.create({
      userId: req.user._id,
      foodItemId: req.body.foodItemId,
      quantity: req.body.quantity
    });
    res.status(201).json(newCartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
