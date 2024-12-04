// stripeController.js
const express = require('express');
const router = express.Router();
// const stripe = require('stripe')('YOUR_SECRET_KEY');
const config = require('../config');
const stripe = require('stripe')(config.secretKey);


router.post('/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
    });
    console.log(`Query result: ${JSON.stringify(customer)}`);
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating customer' });
  }
});

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