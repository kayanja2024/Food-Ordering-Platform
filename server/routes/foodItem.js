const express = require('express');
const router = express.Router();
const { FoodItem } = require('../models');

// Get all food items with category info
router.get('/', async (req, res) => {
  try {
    const foodItems = await FoodItem.find().populate('categoryId');
    res.json(foodItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
