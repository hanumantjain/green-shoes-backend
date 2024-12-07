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

  router.post('/updateCart', async (req, res) => {
    const { user_id, productId, size, quantity } = req.body;
    try {
      // Check if the user exists
      const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
      if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the cart item exists
      const existingCartItem = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
        [user_id, productId, size]
      );
  
      if (existingCartItem.rows.length > 0) {
        // Update the existing cart item
        await pool.query(
          'UPDATE cart SET quantity = $1 WHERE id = $2',
          [quantity, existingCartItem.rows[0].id]
        );
        return res.status(200).json({ message: 'Cart item updated successfully' });
      }
  
      // If item doesn't exist, insert new one
      await pool.query(
        'INSERT INTO cart (user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4)',
        [user_id, productId, size, quantity]
      );
      return res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to update cart item' });
    }
  });
  

  router.post('/removeCartItem', async (req, res) => {
    const { user_id, product_id, size } = req.body;

    try {
        const cartItem = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
            [user_id, product_id, size]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Remove the item completely from the cart
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3',
            [user_id, product_id, size]
        );

        return res.status(200).json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to remove product from cart' });
    }
});


router.get('/getCart', async (req, res) => {
  try {
      // Retrieve user_id from cookies or request query
      const userId = req.cookies.user_id || req.query.user_id;

      if (!userId) {
          return res.status(400).json({ error: 'User not logged in' });
      }

      // Check if the user exists
      const userCheck = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
      if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Fetch cart items along with product details
      const cartItemsQuery = `
          SELECT 
              c.id AS id,
              c.product_id,
              c.size,
              c.quantity,
              p.name AS product_name,
              p.price,
              p.image_urls[1] AS product_image
          FROM 
              cart c
          INNER JOIN 
              products p
          ON 
              c.product_id = p.product_id
          WHERE 
              c.user_id = $1
      `;
      const cartItems = await pool.query(cartItemsQuery, [userId]);

      // Check if there are any cart items
      if (cartItems.rows.length === 0) {
          return res.status(200).json({
              message: 'Your cart is empty.',
              cartItems: [],
          });
      }

      // Identify the item with the highest quantity
      let maxQuantityItem = cartItems.rows[0];
      cartItems.rows.forEach(item => {
          if (item.quantity > maxQuantityItem.quantity) {
              maxQuantityItem = item;
          }
      });

      // Return the cart items along with the highest quantity item
      return res.status(200).json({
          cartItems: cartItems.rows,
          highestQuantityItem: maxQuantityItem,
      });
  } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

  
  // Backend route
  router.post('/addAddress/:userId', async (req, res) => {
    const { userId } = req.params;
    const { address_type, street1, street2, city, state, zip, country } = req.body;

    if (!address_type || !street1 || !city || !state || !zip || !country) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Create a query to insert address into the userAddress table
        const query = `
            INSERT INTO userAddress (user_id, address_type, street1, street2, city, state, zip, country)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        // Execute the query using the pool's query method
        const result = await pool.query(query, [userId, address_type, street1, street2, city, state, zip, country]);

        // Send the newly added address as a response
        res.status(201).json({
            message: `${address_type} Address added successfully`,
            address: result.rows[0], // The inserted address details
        });
    } catch (err) {
        console.error('Error adding address:', err);
        res.status(500).json({ message: 'Failed to add address' });
    }
  });


router.get('/addresses/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM useraddress WHERE user_id = $1', [userId]);
    const addresses = result.rows;

    if (addresses.length === 0) {
      return res.status(404).json({ message: 'No addresses found for this user.' });
    }

    res.json({ addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve addresses' });
  }
});

router.put('/updateAddress/:id', async (req, res) => {
  const { id } = req.params;
  const { street1, street2, city, state, zip, country, address_type } = req.body;

  // Ensure the data is valid
  if (!street1 || !city || !state || !zip || !country || !address_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Update the address in the database
    const result = await pool.query(
      `UPDATE useraddress
       SET street1 = $1, street2 = $2, city = $3, state = $4, zip = $5, country = $6, address_type = $7
       WHERE id = $8 RETURNING *`,
      [street1, street2, city, state, zip, country, address_type, id]
    );

    const updatedAddress = result.rows[0];

    if (!updatedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Respond with the updated address
    res.json({ address: updatedAddress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

router.delete('/deleteAddress/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM useraddress WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete address' });
  }
});


router.get('/payment-details/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = `
      SELECT id, card_number, cardholder_name, expiry_date, created_at
      FROM payment_details
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      res.json(result.rows);  // Return the payment details
    } else {
      res.status(404).json({ message: 'No payment details found for this user.' });
    }
  } catch (err) {
    console.error("Error fetching payment details:", err);
    res.status(500).send('Server error');
  }
});

router.put('/payment-details/:userId', async (req, res) => {
  const { userId } = req.params;
  const { cardId, cardNumber, cardholderName, expiryDate, cvv } = req.body;

  // Ensure that none of these fields are null or undefined
  if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Update the payment details in the database
    const result = await pool.query(
      'UPDATE payment_details SET card_number = $1, cardholder_name = $2, expiry_date = $3, cvv = $4 WHERE id = $5 AND user_id = $6',
      [cardNumber, cardholderName, expiryDate, cvv, cardId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Payment details not found.' });
    }

    res.status(200).json({ message: 'Payment details updated successfully.' });
  } catch (err) {
    console.error('Error updating payment details:', err);
    res.status(500).json({ error: 'Failed to update payment details.' });
  }
});


router.post('/payment-details/:userId', async (req, res) => {
  const { userId } = req.params;  // User ID from the URL params
  const { card_number, cardholder_name, expiry_date, cvv } = req.body;  // Get details from the request body

  // SQL query to insert a new card
  const query = `
    INSERT INTO payment_details (user_id, card_number, cardholder_name, expiry_date, cvv)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  try {
    // Execute the query
    const result = await pool.query(query, [userId, card_number, cardholder_name, expiry_date, cvv]);
    
    // Send back the inserted row (or just return success)
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add payment details.' });
  }
})

router.delete('/payment-details/:userId/:cardId', async (req, res) => {
  const { userId, cardId } = req.params;

  try {
    // Query to delete the card associated with the user
    const query = 'DELETE FROM payment_details WHERE id = $1 AND user_id = $2 RETURNING *';
    const values = [cardId, userId];

    // Execute query
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Card not found or not associated with this user' });
    }

    // Return a success message
    res.status(200).json({ message: 'Card removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while removing the card. Please try again later.' });
  }
})

  module.exports = router