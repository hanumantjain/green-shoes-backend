const express = require('express')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()

router.post('/submitAllDetails', async (req, res) => {
  const {
    personalInfo,
    address,
    billingAddress,
    paymentDetails,
    totalAmount
  } = req.body;

  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber
    } = personalInfo;
    const {
      street1: shippingStreet1,
      street2: shippingStreet2,
      city: shippingCity,
      state: shippingState,
      zip: shippingZip,
      country: shippingCountry
    } = address;
    const {
      street1: billingStreet1,
      street2: billingStreet2,
      city: billingCity,
      state: billingState,
      zip: billingZip,
      country: billingCountry
    } = billingAddress;
    const {
      cardNumber,
      cardName,
      expiry,
      cvv
    } = paymentDetails;

    // SQL query to insert checkout data into the database
    const query = `
      INSERT INTO guest_checkout (
        first_name, last_name, email, phone_number,
        shipping_street1, shipping_street2, shipping_city, shipping_state, shipping_zip, shipping_country,
        billing_street1, billing_street2, billing_city, billing_state, billing_zip, billing_country,
        card_number, card_name, expiry, cvv, total_amount
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21
      )
    `;

    const values = [
      firstName, lastName, email, phoneNumber,
      shippingStreet1, shippingStreet2, shippingCity, shippingState, shippingZip, shippingCountry,
      billingStreet1, billingStreet2, billingCity, billingState, billingZip, billingCountry,
      cardNumber, cardName, expiry, cvv, totalAmount
    ];

    // Execute SQL query
    await pool.query(query, values);

    // Respond with success
    res.status(200).json({ message: 'Checkout data saved successfully' });
  } catch (error) {
    console.error('Error saving checkout data:', error);
    res.status(500).json({ message: 'Failed to save checkout data' });
  }
})


module.exports = router