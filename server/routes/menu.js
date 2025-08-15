// const express = require('express');
// const { Op } = require('sequelize');
// const { Category, FoodItem } = require('../models');
// const { optionalAuth } = require('../middleware/auth');

// const router = express.Router();

// // Get all categories
// router.get('/categories', async (req, res) => {
//   try {
//     const categories = await Category.findAll({
//       where: { isActive: true },
//       order: [['sortOrder', 'ASC'], ['name', 'ASC']]
//     });

//     res.json({ categories });
//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// });

// // Get food items by category
// router.get('/category/:categoryId', async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const { page = 1, limit = 20, sort = 'name' } = req.query;

//     const offset = (page - 1) * limit;

//     const foodItems = await FoodItem.findAndCountAll({
//       where: {
//         categoryId,
//         isAvailable: true
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [[sort, 'ASC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       foodItems: foodItems.rows,
//       totalItems: foodItems.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(foodItems.count / limit)
//     });
//   } catch (error) {
//     console.error('Get food items by category error:', error);
//     res.status(500).json({ error: 'Failed to fetch food items' });
//   }
// });

// // Get all food items with pagination
// router.get('/items', async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       sort = 'name', 
//       order = 'ASC',
//       category,
//       search,
//       minPrice,
//       maxPrice,
//       featured
//     } = req.query;

//     const offset = (page - 1) * limit;
//     const whereClause = { isAvailable: true };

//     // Add filters
//     if (category) {
//       whereClause.categoryId = category;
//     }

//     if (search) {
//       whereClause[Op.or] = [
//         { name: { [Op.like]: `%${search}%` } },
//         { description: { [Op.like]: `%${search}%` } }
//       ];
//     }

//     if (minPrice || maxPrice) {
//       whereClause.price = {};
//       if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
//       if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
//     }

//     if (featured === 'true') {
//       whereClause.isFeatured = true;
//     }

//     const foodItems = await FoodItem.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [[sort, order.toUpperCase()]],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       foodItems: foodItems.rows,
//       totalItems: foodItems.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(foodItems.count / limit)
//     });
//   } catch (error) {
//     console.error('Get food items error:', error);
//     res.status(500).json({ error: 'Failed to fetch food items' });
//   }
// });

// // Get featured food items
// router.get('/featured', async (req, res) => {
//   try {
//     const foodItems = await FoodItem.findAll({
//       where: {
//         isAvailable: true,
//         isFeatured: true
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [['sortOrder', 'ASC'], ['name', 'ASC']],
//       limit: 10
//     });

//     res.json({ foodItems });
//   } catch (error) {
//     console.error('Get featured items error:', error);
//     res.status(500).json({ error: 'Failed to fetch featured items' });
//   }
// });

// // Get single food item
// router.get('/item/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const foodItem = await FoodItem.findOne({
//       where: { 
//         id,
//         isAvailable: true
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }]
//     });

//     if (!foodItem) {
//       return res.status(404).json({ error: 'Food item not found' });
//     }

//     res.json({ foodItem });
//   } catch (error) {
//     console.error('Get food item error:', error);
//     res.status(500).json({ error: 'Failed to fetch food item' });
//   }
// });

// // Search food items
// router.get('/search', async (req, res) => {
//   try {
//     const { q, page = 1, limit = 20 } = req.query;

//     if (!q) {
//       return res.status(400).json({ error: 'Search query is required' });
//     }

//     const offset = (page - 1) * limit;

//     const foodItems = await FoodItem.findAndCountAll({
//       where: {
//         isAvailable: true,
//         [Op.or]: [
//           { name: { [Op.like]: `%${q}%` } },
//           { description: { [Op.like]: `%${q}%` } },
//           { tags: { [Op.like]: `%${q}%` } }
//         ]
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [['name', 'ASC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       foodItems: foodItems.rows,
//       totalItems: foodItems.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(foodItems.count / limit),
//       searchQuery: q
//     });
//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({ error: 'Search failed' });
//   }
// });

// // Get food items by tags
// router.get('/tags/:tag', async (req, res) => {
//   try {
//     const { tag } = req.params;
//     const { page = 1, limit = 20 } = req.query;

//     const offset = (page - 1) * limit;

//     const foodItems = await FoodItem.findAndCountAll({
//       where: {
//         isAvailable: true,
//         tags: { [Op.like]: `%${tag}%` }
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [['name', 'ASC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       foodItems: foodItems.rows,
//       totalItems: foodItems.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(foodItems.count / limit),
//       tag
//     });
//   } catch (error) {
//     console.error('Get items by tag error:', error);
//     res.status(500).json({ error: 'Failed to fetch items by tag' });
//   }
// });

// // Get popular food items (based on order count)
// router.get('/popular', async (req, res) => {
//   try {
//     const { limit = 10 } = req.query;

//     // This would require a more complex query with order statistics
//     // For now, we'll return featured items
//     const foodItems = await FoodItem.findAll({
//       where: {
//         isAvailable: true,
//         isFeatured: true
//       },
//       include: [{
//         model: Category,
//         as: 'category',
//         attributes: ['id', 'name']
//       }],
//       order: [['sortOrder', 'ASC']],
//       limit: parseInt(limit)
//     });

//     res.json({ foodItems });
//   } catch (error) {
//     console.error('Get popular items error:', error);
//     res.status(500).json({ error: 'Failed to fetch popular items' });
//   }
// });

// module.exports = router; 








const express = require('express');
const mongoose = require('mongoose');
const { Category, FoodItem } = require('../models'); // Mongoose models

const router = express.Router();

// Helper: parse page & limit, with defaults and safety
const parsePagination = (page, limit) => {
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  return {
    page: isNaN(p) || p < 1 ? 1 : p,
    limit: isNaN(l) || l < 1 ? 20 : l,
    skip: (isNaN(p) || p < 1 ? 1 : p - 1) * (isNaN(l) || l < 1 ? 20 : l),
  };
};

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get food items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page, limit } = parsePagination(req.query.page, req.query.limit);
    const sortField = req.query.sort || 'name';

    // Validate sort field for safety (optional)
    const validSortFields = ['name', 'price', 'sortOrder', 'createdAt'];
    const sort = validSortFields.includes(sortField) ? sortField : 'name';

    const query = {
      categoryId: mongoose.Types.ObjectId(categoryId),
      isAvailable: true,
    };

    const totalItems = await FoodItem.countDocuments(query);
    const foodItems = await FoodItem.find(query)
      .populate('categoryId', 'name') // populate category name
      .sort({ [sort]: 1 })
      .skip(page * limit - limit)
      .limit(limit)
      .exec();

    res.json({
      foodItems,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error('Get food items by category error:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Get all food items with filters & pagination
router.get('/items', async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query.page, req.query.limit);
    const sortField = req.query.sort || 'name';
    const order = (req.query.order || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
    const {
      category,
      search,
      minPrice,
      maxPrice,
      featured,
    } = req.query;

    const validSortFields = ['name', 'price', 'sortOrder', 'createdAt'];
    const sort = validSortFields.includes(sortField) ? sortField : 'name';

    let query = { isAvailable: true };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = mongoose.Types.ObjectId(category);
      } else {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive
      query.$or = [
        { name: regex },
        { description: regex },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const totalItems = await FoodItem.countDocuments(query);

    const foodItems = await FoodItem.find(query)
      .populate('categoryId', 'name')
      .sort({ [sort]: order })
      .skip(page * limit - limit)
      .limit(limit)
      .exec();

    res.json({
      foodItems,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Get featured food items
router.get('/featured', async (req, res) => {
  try {
    const foodItems = await FoodItem.find({
      isAvailable: true,
      isFeatured: true,
    })
      .populate('categoryId', 'name')
      .sort({ sortOrder: 1, name: 1 })
      .limit(10)
      .exec();

    res.json({ foodItems });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({ error: 'Failed to fetch featured items' });
  }
});

// Get single food item
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid food item ID' });
    }

    const foodItem = await FoodItem.findOne({
      _id: id,
      isAvailable: true,
    })
      .populate('categoryId', 'name')
      .exec();

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json({ foodItem });
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// Search food items
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { page, limit } = parsePagination(req.query.page, req.query.limit);

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');

    const query = {
      isAvailable: true,
      $or: [
        { name: regex },
        { description: regex },
        { tags: regex },
      ],
    };

    const totalItems = await FoodItem.countDocuments(query);
    const foodItems = await FoodItem.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .skip(page * limit - limit)
      .limit(limit)
      .exec();

    res.json({
      foodItems,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      searchQuery: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get food items by tag
router.get('/tags/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const { page, limit } = parsePagination(req.query.page, req.query.limit);

    const regex = new RegExp(tag, 'i');

    const query = {
      isAvailable: true,
      tags: regex,
    };

    const totalItems = await FoodItem.countDocuments(query);
    const foodItems = await FoodItem.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .skip(page * limit - limit)
      .limit(limit)
      .exec();

    res.json({
      foodItems,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      tag,
    });
  } catch (error) {
    console.error('Get items by tag error:', error);
    res.status(500).json({ error: 'Failed to fetch items by tag' });
  }
});

// Get popular food items (placeholder - returning featured items)
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    // TODO: Implement popular logic based on orders count
    // For now return featured items
    const foodItems = await FoodItem.find({
      isAvailable: true,
      isFeatured: true,
    })
      .populate('categoryId', 'name')
      .sort({ sortOrder: 1 })
      .limit(limit)
      .exec();

    res.json({ foodItems });
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({ error: 'Failed to fetch popular items' });
  }
});

module.exports = router;
