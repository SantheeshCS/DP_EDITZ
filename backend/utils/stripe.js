const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder-key', {
  apiVersion: '2023-10-16', // Ensure stable API version usage
});

/**
 * Creates a Stripe Checkout Session for a template purchase.
 * @param {Object} template - Mongoose Template document
 * @param {string} orderId - The Mongoose Order ID created for this checkout
 * @returns {Promise<Object>} The Stripe session object
 */
const createCheckoutSession = async (template, orderId) => {
  if (!process.env.CLIENT_URL) {
    throw new Error('CLIENT_URL environment variable is missing.');
  }

  // Stripe line items expects name, currency, unit_amount (smallest currency unit, e.g. paise for INR)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr', // default to INR (paise)
          product_data: {
            name: template.title,
            description: template.description || `Digital Template: ${template.category}`,
            images: template.previewImageUrl ? [template.previewImageUrl] : [],
          },
          unit_amount: template.price, // in paise
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // customer_email is collected automatically by Stripe or we can let stripe handle it
    // Stripe collects email if we don't pre-fill it.
    metadata: {
      orderId: orderId.toString(),
      templateId: template._id.toString(),
    },
    success_url: `${process.env.CLIENT_URL.replace(/\/$/, '')}/download/${orderId}`,
    cancel_url: `${process.env.CLIENT_URL.replace(/\/$/, '')}/templates/${template._id}`,
  });

  return session;
};

module.exports = {
  stripe,
  createCheckoutSession,
};
