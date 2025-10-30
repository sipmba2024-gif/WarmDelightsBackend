const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paisa
      currency,
      metadata,
      payment_method_types: ['card'],
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Payment processing failed');
  }
};

// Handle webhook events
const handleWebhook = async (payload, sig) => {
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new Error('Invalid webhook signature');
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Update order status in database
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('PaymentIntent failed:', failedPaymentIntent.id);
      // Update order status in database
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
};