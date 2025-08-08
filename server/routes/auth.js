const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { sendOTP, sendEmail } = require('../services/notificationService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('firstName').trim().isLength({ min: 2, max: 100 }),
  body('lastName').trim().isLength({ min: 2, max: 100 }),
  body('password').optional().isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone, firstName, lastName, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or phone number already exists' 
      });
    }

    // Create user
    const user = await User.create({
      email,
      phone,
      firstName,
      lastName,
      password: password || null
    });

    // Send OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOTP(phone, otp);

    // Store OTP in user preferences temporarily
    user.preferences = { ...user.preferences, verificationOTP: otp };
    await user.save();

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully. Please verify your phone number.',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with email/password
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Login with OTP
router.post('/login-otp', [
  body('phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp } = req.body;

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify OTP
    if (user.preferences?.verificationOTP !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    user.preferences = { ...user.preferences };
    delete user.preferences.verificationOTP;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Send OTP
router.post('/send-otp', [
  body('phone').matches(/^\+?[1-9]\d{1,14}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOTP(phone, otp);

    // Store OTP
    user.preferences = { ...user.preferences, verificationOTP: otp };
    await user.save();

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify phone number
router.post('/verify-phone', [
  body('phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp } = req.body;

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.preferences?.verificationOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.preferences = { ...user.preferences };
    delete user.preferences.verificationOTP;
    await user.save();

    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    user.preferences = { ...user.preferences, resetToken };
    await user.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Password Reset', `Click here to reset your password: ${resetLink}`);

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || user.preferences?.resetToken !== token) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    user.preferences = { ...user.preferences };
    delete user.preferences.resetToken;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router; 