const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Template = require('../models/Template');
const Order = require('../models/Order');
const { createCheckoutSession } = require('../utils/stripe');

// POST /api/checkout/:id — Initiate checkout for a template
router.post('/checkout/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify template exists
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 2. Pre-generate a MongoDB Order ID to link with Stripe
    const orderId = new mongoose.Types.ObjectId();

    // 3. Create Stripe Checkout Session
    const session = await createCheckoutSession(template, orderId);

    // 4. Create and save the pending Order
    const order = new Order({
      _id: orderId,
      templateId: template._id,
      stripeSessionId: session.id,
      status: 'pending',
    });

    await order.save();

    // 5. Return the Stripe checkout URL to redirect the client
    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error initiating checkout.' });
  }
});

// GET /api/download/:orderId — Retrieve paid download link and verify validity
router.get('/download/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order reference.' });
    }

    const order = await Order.findById(orderId).populate('templateId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status === 'pending') {
      return res.json({
        status: 'pending',
        message: 'Confirming payment... (auto-refresh every 5 seconds)',
      });
    }

    // Check if the URL has expired
    const isExpired =
      order.status === 'expired' ||
      (order.urlExpiresAt && new Date(order.urlExpiresAt) < new Date());

    if (isExpired) {
      if (order.status !== 'expired') {
        order.status = 'expired';
        await order.save();
      }
      return res.json({
        status: 'expired',
        message: 'Your download link has expired. Please contact support.',
      });
    }

    // Valid paid order
    res.json({
      status: 'paid',
      signedDownloadUrl: order.signedDownloadUrl,
      templateTitle: order.templateId ? order.templateId.title : 'Template File',
      expiresInSeconds: Math.max(0, Math.floor((new Date(order.urlExpiresAt) - new Date()) / 1000)),
    });
  } catch (error) {
    console.error('Download Verification Error:', error.message);
    res.status(500).json({ error: 'Server error verifying download link.' });
  }
});

module.exports = router;
