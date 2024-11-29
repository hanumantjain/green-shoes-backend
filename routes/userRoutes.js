const express = require('express')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()
require('dotenv').config()

router.post('/addToCart', async (req, res) => {
    const { user_id, productId, size, quantity = 1 } = req.body;
    try {
      // Check if the product exists, if the user exists, etc.
      const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
      if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const existingCartItem = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
        [user_id, productId, size]
      );
  
      if (existingCartItem.rows.length > 0) {
        // Update the existing cart item
        await pool.query(
          'UPDATE cart SET quantity = quantity + $1 WHERE id = $2',
          [quantity, existingCartItem.rows[0].id]
        );
        return res.status(200).json({ message: 'Product updated in cart' });
      }
  
      // Insert new product into the cart
      await pool.query(
        'INSERT INTO cart (user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4)',
        [user_id, productId, size, quantity]
      );
  
      return res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to add product to cart' });
    }
  });
  
  router.post('/address', async (req, res) => {
    const { type, street1, street2, city, state, zip, country, userId } = req.body;
    console.log('Received data:', req.body); // Log incoming request data for debugging
  
    if (!type || !street1 || !city || !state || !zip || !country || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const query = `
        INSERT INTO userAddress (user_id, address_type, street1, street2, city, state, zip, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [userId, type, street1, street2, city, state, zip, country];
  
      const result = await pool.query(query, values);
  
      if (result.rowCount === 0) {
        return res.status(500).json({ message: 'Failed to insert address' });
      }
  
      res.status(201).json({ message: 'Address added successfully', data: result.rows[0] });
    } catch (error) {
      console.error('Error saving address:', error.message);  // Enhanced logging
      console.error('Stack trace:', error.stack);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  



  module.exports = router