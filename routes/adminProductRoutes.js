const express = require('express');
const pool = require('../connection/postgreSQLConnect');
const router = express.Router();

//Add Products
router.post('/', async(req, res) => {
    const { name, description, price, category_id, image_url, sizes, color } = req.body
    if (!name || !price || !category_id || !sizes || !color) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        await pool.query('BEGIN')

        const addProductQuery = `
            INSERT INTO products (name, description, price, category_id, image_url, color, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING product_id
        `
        const productResult = await pool.query(addProductQuery, [ name, description, price, category_id, image_url, color])
        const productId = productResult.rows[0].product_id
        console.log(productId)
        const addSizeQury = `
            INSERT INTO product_sizes (product_id, size_id, stock_quantity, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        for (const size of sizes) {
            const { size_id, quantity } = size
            await pool.query(addSizeQury, [productId, size_id, quantity]);
        }
        await pool.query('COMMIT')
        res.status(201).json({ message: "Product added successfully", productId })
    } catch  (error) {
        await pool.query('ROLLBACK')
        res.status(500).json({error: 'An error'})
    }
})

//Update Product
router.put('/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, gender, category_id, image_url } = req.body;
  
    // Validate the productId
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
  
    // Prepare the query with optional fields to update
    const query = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        gender = COALESCE($4, gender),
        category_id = COALESCE($5, category_id),
        image_url = COALESCE($6, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $7
      RETURNING *;
    `;
    const values = [name, description, price, gender, category_id, image_url, productId];
  
    try {
      // Execute the query
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Respond with the updated product
      res.status(200).json({ message: 'Product updated successfully', product: result.rows[0] });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
});

//Deleting product
router.delete('/:id', async (req, res) => {
    const productId = req.params.id;
  
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
  
    try {
      // Mark the product as inactive instead of deleting it
      const query = `
        UPDATE products
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $1
        RETURNING *;
      `;
      const values = [productId];
  
      // Execute the query
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Respond with a success message and the deactivated product
      res.status(200).json({ message: 'Product deactivated successfully', product: result.rows[0] });
    } catch (error) {
      console.error('Error deactivating product:', error);
      res.status(500).json({ message: 'Failed to deactivate product', error: error.message });
    }
});  
  
//Add product inventory giving size as variant
router.post('/api/admin/products/:id/variants', async (req, res) => {
    const productId = req.params.id;
    const { size_id, stock_quantity } = req.body;
  
    // Validate required fields
    if (!productId || !size_id || stock_quantity === undefined) {
      return res.status(400).json({ message: 'Product ID, size ID, and stock quantity are required' });
    }
  
    try {
      // Insert the new variant into product_sizes table
      const query = `
        INSERT INTO product_sizes (product_id, size_id, stock_quantity, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const values = [productId, size_id, stock_quantity];
  
      // Execute the query
      const result = await pool.query(query, values);
  
      // Respond with the newly created variant
      res.status(201).json({ message: 'Product variant added successfully', variant: result.rows[0] });
    } catch (error) {
      console.error('Error adding product variant:', error);
      res.status(500).json({ message: 'Failed to add product variant', error: error.message });
    }
});

//Update product inventory giving size and new qty
router.put('/:id/variants/:variantId', async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    const { stock_quantity } = req.body;

    // Validate required parameters
    if (!productId || !variantId) {
        return res.status(400).json({ message: 'Product ID and Variant ID are required' });
    }

    // Validate stock_quantity is provided
    if (stock_quantity === undefined) {
        return res.status(400).json({ message: 'Stock quantity is required to update' });
    }

    // Prepare the update query
    const query = `
        UPDATE product_sizes
        SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2 AND product_size_id = $3
        RETURNING *;
    `;
    const values = [stock_quantity, productId, variantId];

    try {
        // Execute the update query
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product variant not found' });
        }

        // Respond with the updated variant details
        res.status(200).json({ message: 'Product variant stock quantity updated successfully', variant: result.rows[0] });
    } catch (error) {
        console.error('Error updating product variant stock quantity:', error);
        res.status(500).json({ message: 'Failed to update product variant stock quantity', error: error.message });
    }
});

//Incrementing or Decrementing stock_quantity by 1 based on the action query parameter(e.g., ?action=increase or ?action=decrease)
router.put('/:id/variants/:variantId', async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    const { action } = req.query; // Retrieve the action from query parameters
    let { stock_quantity } = req.body;
  
    // Validate required parameters
    if (!productId || !variantId) {
      return res.status(400).json({ message: 'Product ID and Variant ID are required' });
    }
  
    // Logic for increasing or decreasing stock quantity by 1
    if (action === 'increase') {
      stock_quantity = 1; // Set quantity change to +1
    } else if (action === 'decrease') {
      stock_quantity = -1; // Set quantity change to -1
    } else if (stock_quantity === undefined) {
      return res.status(400).json({ message: 'Stock quantity or a valid action is required to update' });
    }
  
    // Prepare the update query
    const query = `
      UPDATE product_sizes
      SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $2 AND product_size_id = $3
      RETURNING *;
    `;
    const values = [stock_quantity, productId, variantId];
  
    try {
      // Execute the update query
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product variant not found' });
      }
  
      // Respond with the updated variant details
      res.status(200).json({ message: 'Product variant stock quantity updated successfully', variant: result.rows[0] });
    } catch (error) {
      console.error('Error updating product variant stock quantity:', error);
      res.status(500).json({ message: 'Failed to update product variant stock quantity', error: error.message });
    }
});

//Delete a product variant
router.delete('/api/admin/products/:id/variants/:variantId', async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variantId;
  
    // Validate required parameters
    if (!productId || !variantId) {
      return res.status(400).json({ message: 'Product ID and Variant ID are required' });
    }
  
    // Prepare the delete query
    const query = `
      DELETE FROM product_sizes
      WHERE product_id = $1 AND product_size_id = $2
      RETURNING *;
    `;
    const values = [productId, variantId];
  
    try {
      // Execute the delete query
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product variant not found' });
      }
  
      // Respond with a success message
      res.status(200).json({ message: 'Product variant deleted successfully' });
    } catch (error) {
      console.error('Error deleting product variant:', error);
      res.status(500).json({ message: 'Failed to delete product variant', error: error.message });
    }
});

module.exports = router;