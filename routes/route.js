const express = require('express')
const bcrypt = require('bcryptjs/dist/bcrypt')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()
require('dotenv').config()

//Add Sizes
router.post('/add-size', async (req, res) => {
    const { size_label } = req.body;
  
    // Input validation (e.g., checking if size_label exists)
    if (!size_label) {
      return res.status(400).json({ message: 'Size label is required.' });
    }
  
    try {
      // SQL query to insert the new size
      const query = `
        INSERT INTO sizes (size_label)
        VALUES ($1)
        RETURNING size_id, size_label, created_at, updated_at;
      `;
      const values = [size_label];
  
      const result = await pool.query(query, values);
      
      // Respond with the newly added size
      res.status(201).json({
        message: 'Size added successfully',
        size: result.rows[0],  // This contains the inserted row
      });
    } catch (error) {
      console.error('Error inserting size:', error);
      res.status(500).json({ message: 'Failed to add size' });
    }
  });


//Admin Register 
router.post('/adminHome', async (req, res) => {
    const {name, username, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM admins WHERE username = $1',[username])
        const adminExists = result.rows

        if(adminExists.length > 0){
            return res.status(409).json({message: 'Admin exists'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new admin
        await pool.query('INSERT INTO admins (name, username, password) VALUES ($1, $2, $3)',
            [name, username, hashedPassword])
        res.status(200).json({message: 'Admin Created successfully'})

    }   catch (error){
            res.staus(500).json({message: 'Server Error'})
        }
    
})

//Admin Login
router.post('/admin', async (req, res) => {
    const {username, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM admins WHERE username = $1',[username])
        const admin = result.rows[0]
        //checking username
        if(!admin){
            return res.status(404).json({message: 'Admin not found'})
        }

        //checking password
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'})
        }
        return res.status(200).json({message: 'Login Successful'})
    }catch (error){
        res.status(500).json({message: 'Server Error'})
    }
})

//Check User
router.post('/checkUser', async (req, res) => {
    const { userEmail } = req.body 
    try{
        const result = await pool.query('SELECT * FROM users WHERE userEmail = $1', [userEmail])
        const user = result.rows[0]
        if(user){
            return res.status(200).json({message: 'User found'})
        }else{
            return res.status(204).json({message: 'User not found'})
        }
    }catch (error){
        console.error('Error during user registration:', error)
        return res.status(500).json({message: 'Server Error'})
        }
})

//User Register
router.post('/userSignUp', async (req, res) => {
    const {firstName, lastName, userEmail, userPassword} = req.body
    try{
        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(userPassword, salt)

        //Create new user
        await pool.query(`INSERT INTO users 
                                            (firstName, lastName, userEmail, userPassword) 
                                            VALUES ($1, $2, $3, $4)`,
                                            [firstName, lastName, userEmail, hashedPassword])

        res.status(200).json({ message: 'User Created Successfully'})
    }catch (error){
        console.error('Error during user registration:', error)
        return res.status(500).json({message: 'Server Error'})
        }
})

//UserLogin
router.post('/userLogin', async (req, res) => {
    const { userEmail, userPassword } = req.body
    try {
        const result = await pool.query('SELECT * FROM users WHERE userEmail = $1', [userEmail])
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(userPassword, user.userpassword)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        return res.status(200).json({ message: 'Login Successful'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server Error' })
    }
})

router.post('/address', async(req, res) => {
    const {userStreet1, userStreet2, userCity, userState, userCountry, userZipCode, userPhoneNumber } = req.body 
     try{
            await pool.query(`INSERT INTO users 
                (userStreet1, userStreet2, userCity, userState, userCountry, userZipCode, userPhoneNumber) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userStreet1, userStreet2, userCity, userState, userCountry, userZipCode, userPhoneNumber])
            res.status(200).json({message: 'Address Added'})
     } catch (error){
        return res.status(500).json({message: 'Server Error'})
     }
})

//Add Products
router.post('/addProducts', async(req, res) => {
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

//Get Products
router.get('/getProducts', async (req, res) => {
    try {
        const result = await pool.query(`SELECT product_id, name, description, price, image_url FROM products`)
        res.status(200).json(result.rows)
    } catch (error) {
        return res.status(500).json({message: 'Server Error'})
    }
})

//Get Product by id
router.get('/getProducts/:id', async (req, res) => {
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
            GROUP BY p.product_id, c.category_name
            `, [productId])

            if (result.rows.length === 0){
                return res.status(404).json({ error: 'Product not found' })
            }
            res.status(200).json(result.rows[0])

    } catch (error) {
        // return res.status(500).json({message: 'Server Error'})
        console.error('Error adding product:', error);  // Log the full error
        return res.status(500).json({ error: 'An error occurred', details: error.message });
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

module.exports = router