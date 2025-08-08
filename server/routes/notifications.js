const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { sendEmail, sendSMS } = require('../services/notificationService');

const router = express.Router();

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = req.user.preferences?.notifications || {
      email: true,
      sms: true,
      orderUpdates: true,
      promotions: false,
      newsletter: false
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', [
  auth,
  body('email').optional().isBoolean(),
  body('sms').optional().isBoolean(),
  body('orderUpdates').optional().isBoolean(),
  body('promotions').optional().isBoolean(),
  body('newsletter').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const currentPreferences = req.user.preferences || {};
    const notificationPreferences = currentPreferences.notifications || {};

    // Update notification preferences
    const updatedPreferences = {
      ...notificationPreferences,
      ...req.body
    };

    // Update user preferences
    req.user.preferences = {
      ...currentPreferences,
      notifications: updatedPreferences
    };
    await req.user.save();

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Send test notification
router.post('/test', [
  auth,
  body('type').isIn(['email', 'sms']),
  body('message').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, message } = req.body;

    if (type === 'email') {
      const testMessage = message || 'This is a test email notification from your food ordering platform.';
      await sendEmail(
        req.user.email,
        'Test Notification',
        `<h2>Test Email</h2><p>${testMessage}</p>`
      );
    } else if (type === 'sms') {
      const testMessage = message || 'This is a test SMS notification from your food ordering platform.';
      await sendSMS(req.user.phone, testMessage);
    }

    res.json({
      message: `Test ${type.toUpperCase()} notification sent successfully`
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get notification history (if implemented)
router.get('/history', auth, async (req, res) => {
  try {
    // This would typically query a notifications table
    // For now, we'll return a placeholder
    const notifications = [];

    res.json({ notifications });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

// Mark notification as read (if implemented)
router.put('/history/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // This would typically update a notifications table
    // For now, we'll return a placeholder response

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Bulk update notification preferences
router.put('/preferences/bulk', [
  auth,
  body('preferences').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { preferences } = req.body;

    const currentPreferences = req.user.preferences || {};

    // Update user preferences
    req.user.preferences = {
      ...currentPreferences,
      notifications: preferences
    };
    await req.user.save();

    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Bulk update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Unsubscribe from notifications
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['email', 'sms', 'all'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPreferences = user.preferences || {};
    const notificationPreferences = currentPreferences.notifications || {};

    if (type === 'all') {
      notificationPreferences.email = false;
      notificationPreferences.sms = false;
    } else {
      notificationPreferences[type] = false;
    }

    user.preferences = {
      ...currentPreferences,
      notifications: notificationPreferences
    };
    await user.save();

    res.json({
      message: `Successfully unsubscribed from ${type} notifications`
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Resubscribe to notifications
router.post('/resubscribe', [
  auth,
  body('type').isIn(['email', 'sms', 'all'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;

    const currentPreferences = req.user.preferences || {};
    const notificationPreferences = currentPreferences.notifications || {};

    if (type === 'all') {
      notificationPreferences.email = true;
      notificationPreferences.sms = true;
    } else {
      notificationPreferences[type] = true;
    }

    req.user.preferences = {
      ...currentPreferences,
      notifications: notificationPreferences
    };
    await req.user.save();

    res.json({
      message: `Successfully resubscribed to ${type} notifications`
    });
  } catch (error) {
    console.error('Resubscribe error:', error);
    res.status(500).json({ error: 'Failed to resubscribe' });
  }
});

module.exports = router; 