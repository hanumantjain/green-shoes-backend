const express = require('express');
const pool = require('../connection/postgreSQLConnect');
const router = express.Router();

//Get Products
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT product_id, name, description, price, image_url FROM products`)
        res.status(200).json(result.rows)
    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

//Get Product by id
router.get('/:id', async (req, res) => {
    const productId = parseInt(req.params.id)

    try{
        const result = await pool.query(`
            SELECT p.product_id, p.name, p.description, p.price, p.image_url, c.category_name,
                json_agg(json_build_object(
                    'size_label', s.size_label,
                    'stock_quantity', ps.stock_quantity
                )) AS sizes
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
            LEFT JOIN sizes s ON ps.size_id = s.size_id
            WHERE p.product_id = $1
            GROUP BY p.product_id, c.category_name;
            `, [productId])

            if (result.rows.length === 0){
                return res.status(404).json({ error: 'Product not found' })
            }
            res.status(200).json(result.rows[0])

    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

//Get categories
router.get('/getCategory', async(req, res) => {
    try{
        const result = await pool.query(`SELECT * FROM categories`)
        res.status(200).json(result.rows)
    }catch (error){
        return res.status(500).json({message: 'Server Error'})
    }
})

//Get Sizes
router.get('/getSizes', async(req, res) => {
    try{
        const result = await pool.query(`SELECT * FROM sizes`)
        res.status(200).json(result.rows)
    }catch (error){
        return res.status(500).json({message: 'Server Error'})
    }
})

module.exports = router;