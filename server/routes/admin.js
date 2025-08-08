const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Category, FoodItem, Order, OrderItem } = require('../models');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/categories', [
  adminAuth,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('sortOrder').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, sortOrder } = req.body;

    const category = await Category.create({
      name,
      description,
      sortOrder: sortOrder || 0
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString(),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update(req.body);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has food items
    const foodItemCount = await FoodItem.count({ where: { categoryId: id } });
    if (foodItemCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${foodItemCount} food items` 
      });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== FOOD ITEM MANAGEMENT ====================

// Get all food items
router.get('/food-items', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.categoryId = category;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }
    if (status !== undefined) whereClause.isAvailable = status === 'available';

    const foodItems = await FoodItem.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      foodItems: foodItems.rows,
      totalItems: foodItems.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(foodItems.count / limit)
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Create food item
router.post('/food-items', [
  adminAuth,
  upload.single('image'),
  body('name').trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }),
  body('categoryId').isInt({ min: 1 }),
  body('preparationTime').optional().isInt({ min: 1 }),
  body('calories').optional().isInt({ min: 0 }),
  body('isAvailable').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      categoryId,
      preparationTime,
      calories,
      isAvailable = true,
      isFeatured = false,
      allergens,
      ingredients,
      nutritionalInfo,
      tags
    } = req.body;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const foodItemData = {
      name,
      description,
      price,
      categoryId,
      preparationTime: preparationTime || 30,
      calories,
      isAvailable,
      isFeatured,
      allergens: allergens ? JSON.parse(allergens) : [],
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      nutritionalInfo: nutritionalInfo ? JSON.parse(nutritionalInfo) : {},
      tags: tags ? JSON.parse(tags) : []
    };

    if (req.file) {
      foodItemData.image = `/uploads/${req.file.filename}`;
    }

    const foodItem = await FoodItem.create(foodItemData);

    res.status(201).json({
      message: 'Food item created successfully',
      foodItem
    });
  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// Update food item
router.put('/food-items/:id', [
  adminAuth,
  upload.single('image'),
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  body('categoryId').optional().isInt({ min: 1 }),
  body('preparationTime').optional().isInt({ min: 1 }),
  body('calories').optional().isInt({ min: 0 }),
  body('isAvailable').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const foodItem = await FoodItem.findByPk(id);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const updateData = { ...req.body };
    
    // Parse JSON fields
    if (req.body.allergens) updateData.allergens = JSON.parse(req.body.allergens);
    if (req.body.ingredients) updateData.ingredients = JSON.parse(req.body.ingredients);
    if (req.body.nutritionalInfo) updateData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await foodItem.update(updateData);

    res.json({
      message: 'Food item updated successfully',
      foodItem
    });
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// Delete food item
router.delete('/food-items/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findByPk(id);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    await foodItem.destroy();

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: ['id', 'itemName', 'quantity', 'unitPrice', 'totalPrice']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      orders: orders.rows,
      totalOrders: orders.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(orders.count / limit)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', [
  adminAuth,
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']),
  body('adminNotes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await Order.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;

    // Set actual delivery time if delivered
    if (status === 'delivered' && oldStatus !== 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Send notification to customer
    const { sendDeliveryUpdate } = require('../services/notificationService');
    await sendDeliveryUpdate(order.user, order, status);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get order statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalFoodItems,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      Order.count(),
      User.count({ where: { role: 'customer' } }),
      FoodItem.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.sum('totalAmount', { where: { paymentStatus: 'paid' } })
    ]);

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      totalOrders,
      totalUsers,
      totalFoodItems,
      pendingOrders,
      totalRevenue: totalRevenue || 0,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { phone: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: users.rows,
      totalUsers: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status
router.put('/users/:id/status', [
  adminAuth,
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router; 