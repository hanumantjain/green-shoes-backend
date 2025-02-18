// stripeController.js
const express = require('express');
const router = express.Router();
// const stripe = require('stripe')('YOUR_SECRET_KEY');
const config = require('../config');
const stripe = require('stripe')(config.secretKey);


router.post('/createCustomer', async (req, res) => {
  try {
      const { userEmail } = req.body;

      // Create the Stripe customer
      const customer = await stripe.customers.create({
          email: userEmail,
      });

      // Optionally, store the customer.id in your database for future transactions
      // For example: await User.update({ stripeCustomerId: customer.id }, { where: { email: userEmail } });

      res.status(200).json({ message: 'Customer created successfully', customerId: customer.id });
  } catch (error) {
      console.error('Stripe customer creation error:', error);
      res.status(500).json({ message: 'Error creating Stripe customer' });
  }
})

router.post('/create-payment-method', async (req, res) => {
    try {
      const { paymentMethodType, cardNumber, expMonth, expYear, cvc } = req.body;
  
      const paymentMethod = await stripe.paymentMethods.create({
        type: paymentMethodType,
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc,
        },
      });
  
      res.status(200).json(paymentMethod);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating payment method' });
    }
  });

  router.post('/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency, paymentMethodId } = req.body;
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: [paymentMethodId],
      });
  
      res.status(200).json(paymentIntent);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating payment intent' });
    }
  });

  router.post('/confirm-payment-intent', async (req, res) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;
  
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
  
      res.status(200).json(paymentIntent);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error confirming payment intent' });
    }
  });

module.exports = router;