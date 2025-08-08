const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Address } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone } = req.body;

    // Check if email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Check if phone is already taken
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(400).json({ error: 'Phone number is already taken' });
      }
    }

    // Update user
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: email || req.user.email,
      phone: phone || req.user.phone
    });

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', [
  auth,
  body('label').trim().isLength({ min: 2, max: 100 }),
  body('firstName').trim().isLength({ min: 2, max: 100 }),
  body('lastName').trim().isLength({ min: 2, max: 100 }),
  body('phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('street').trim().isLength({ min: 5, max: 255 }),
  body('city').trim().isLength({ min: 2, max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('postalCode').optional().trim().isLength({ max: 20 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      label,
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country = 'Uganda',
      isDefault = false,
      additionalInfo
    } = req.body;

    // If this is the default address, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id, isDefault: true } }
      );
    }

    const address = await Address.create({
      userId: req.user.id,
      label,
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
      additionalInfo
    });

    res.status(201).json({
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/addresses/:id', [
  auth,
  body('label').optional().trim().isLength({ min: 2, max: 100 }),
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('street').optional().trim().isLength({ min: 5, max: 255 }),
  body('city').optional().trim().isLength({ min: 2, max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('postalCode').optional().trim().isLength({ max: 20 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('isDefault').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isDefault } = req.body;

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If this is the default address, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id, isDefault: true, id: { [require('sequelize').Op.ne]: id } } }
      );
    }

    await address.update(req.body);

    res.json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Set default address
router.post('/addresses/:id/default', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Unset other defaults
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.id, isDefault: true } }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({
      message: 'Default address updated successfully',
      address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

module.exports = router; 