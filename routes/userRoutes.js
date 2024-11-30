const express = require('express')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()
require('dotenv').config()

router.post('/addToCart', async (req, res) => {
    const { userId, productId, size, quantity = 1 } = req.body;
    try {
      // Check if the product exists, if the user exists, etc.
      const userExists = await pool.query('SELECT * FROM users WHERE userid = $1', [userId]);
      if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const existingCartItem = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
        [userId, productId, size]
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
        [userId, productId, size, quantity]
      );
  
      return res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to add product to cart' });
    }
  });
  
  router.post('/userAddress', async(req, res) => {
    const {userid, address_type, street1, street2, city, state, country, zip } = req.body 
     try{
            await pool.query(`INSERT INTO userAddress 
                (userid, address_type, street1, street2, city, state, country, zip ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [userid, address_type, street1, street2, city, state, country, zip])
            res.status(200).json({message: 'Address Added'})
     } catch (error){
        return res.status(500).json({message: 'Server Error'})
     }
})



  module.exports = router