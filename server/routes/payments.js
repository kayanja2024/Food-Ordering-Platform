const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, User } = require('../models');
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const { sendPaymentConfirmation } = require('../services/notificationService');

const router = express.Router();

// Initiate payment
router.post('/initiate', [
  auth,
  body('orderId').isInt({ min: 1 }),
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, phoneNumber } = req.body;

    // Get order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    if (!['airtel_money', 'mtn_mobile_money'].includes(order.paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method for this order' });
    }

    // Initiate payment
    const paymentResult = await paymentService.processPayment(
      order.paymentMethod,
      phoneNumber,
      order.totalAmount,
      order.orderNumber,
      `Payment for order ${order.orderNumber}`
    );

    if (!paymentResult.success) {
      return res.status(400).json({ error: paymentResult.error });
    }

    // Update order with transaction ID
    order.paymentTransactionId = paymentResult.transactionId;
    await order.save();

    res.json({
      message: 'Payment initiated successfully',
      transactionId: paymentResult.transactionId,
      status: paymentResult.status
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Verify payment
router.post('/verify', [
  auth,
  body('orderId').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;

    // Get order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.paymentTransactionId) {
      return res.status(400).json({ error: 'No payment transaction found for this order' });
    }

    // Verify payment
    const verificationResult = await paymentService.verifyPayment(
      order.paymentMethod,
      order.paymentTransactionId
    );

    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.error });
    }

    // Update order status based on payment verification
    if (verificationResult.status === 'SUCCESSFUL' || verificationResult.status === 'COMPLETED') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();

      // Send payment confirmation
      await sendPaymentConfirmation(req.user, order);

      res.json({
        message: 'Payment verified successfully',
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      });
    } else if (verificationResult.status === 'FAILED' || verificationResult.status === 'REJECTED') {
      order.paymentStatus = 'failed';
      await order.save();

      res.json({
        message: 'Payment verification failed',
        paymentStatus: 'failed'
      });
    } else {
      res.json({
        message: 'Payment is still pending',
        paymentStatus: 'pending',
        status: verificationResult.status
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Payment callback (for webhooks)
router.post('/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { transactionId, status, amount, reference } = req.body;

    // Find order by transaction ID or reference
    const order = await Order.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { paymentTransactionId: transactionId },
          { orderNumber: reference }
        ]
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify amount matches
    if (parseFloat(amount) !== parseFloat(order.totalAmount)) {
      console.error('Payment amount mismatch:', { expected: order.totalAmount, received: amount });
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Update order status
    if (status === 'SUCCESSFUL' || status === 'COMPLETED') {
      order.paymentStatus = 'paid';
      if (order.status === 'pending') {
        order.status = 'confirmed';
      }
      await order.save();

      // Send payment confirmation
      await sendPaymentConfirmation(order.user, order);
    } else if (status === 'FAILED' || status === 'REJECTED') {
      order.paymentStatus = 'failed';
      await order.save();
    }

    res.json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Get payment methods
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      description: 'Pay using Airtel Money',
      icon: 'airtel',
      isAvailable: true
    },
    {
      id: 'mtn_mobile_money',
      name: 'MTN Mobile Money',
      description: 'Pay using MTN Mobile Money',
      icon: 'mtn',
      isAvailable: true
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay with cash when your order arrives',
      icon: 'cash',
      isAvailable: true
    }
  ];

  res.json({ paymentMethods });
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      },
      attributes: ['id', 'paymentStatus', 'paymentMethod', 'paymentTransactionId', 'totalAmount']
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.paymentTransactionId,
      amount: order.totalAmount
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

module.exports = router; 