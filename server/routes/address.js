const express = require('express');
const router = express.Router();
const { Address } = require('../models');

// Get addresses for a user
router.get('/:userId', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
