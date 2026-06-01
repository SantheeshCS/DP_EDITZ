const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Template = require('../models/Template');
const { stripe } = require('../utils/stripe');
const { generateSignedUrl } = require('../utils/supabase');

// POST /api/webhook — Process Stripe checkout webhook events
// Express raw body parser is applied at route definition level or server level BEFORE express.json()
router.post(
  '/',
  express.raw({ type: 'application/json' }), // Apply raw body parser to verify signatures
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !endpointSecret) {
        throw new Error('Missing stripe-signature header or STRIPE_WEBHOOK_SECRET.');
      }
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Signature Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata ? session.metadata.orderId : null;
      const templateId = session.metadata ? session.metadata.templateId : null;

      console.log(`Stripe Webhook: checkout.session.completed received for order ${orderId}`);

      try {
        // 1. Retrieve the corresponding order
        const order = await Order.findById(orderId);
        if (!order) {
          console.error(`Webhook Processing Error: Order ${orderId} not found in database.`);
          return res.status(404).send('Order not found');
        }

        // 2. Retrieve the template to get the private storage path
        const template = await Template.findById(templateId);
        if (!template) {
          console.error(`Webhook Processing Error: Template ${templateId} not found.`);
          return res.status(404).send('Template not found');
        }

        // 3. Generate a 15-minute Supabase signed URL (900 seconds)
        const expirySeconds = 900;
        const signedUrl = await generateSignedUrl(template.fileStoragePath, expirySeconds);

        // 4. Update order details
        order.status = 'paid';
        order.customerEmail = session.customer_details ? session.customer_details.email : session.customer_email;
        order.signedDownloadUrl = signedUrl;
        order.urlExpiresAt = new Date(Date.now() + expirySeconds * 1000);

        await order.save();

        // 5. Increment download/purchase count of the template
        template.downloadCount += 1;
        await template.save();

        console.log(`Webhook Processed Successfully: Order ${orderId} marked as paid. Link generated.`);
      } catch (dbError) {
        console.error('Webhook Database/Supabase Update Failed:', dbError.message);
        return res.status(500).send('Internal server database error during webhook processing.');
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

module.exports = router;
