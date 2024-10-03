const express = require('express')
const bcrypt = require('bcryptjs/dist/bcrypt')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()

//Admin Register 
router.post('/adminHome', async (req, res) => {
    const {name, username, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM admins WHERE username = $1',[username])
        const adminExists = result.rows

        if(adminExists.length > 0){
            return res.json({message: 'Admin exists'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new admin
        await pool.query('INSERT INTO admins (name, username, password) VALUES ($1, $2, $3)',
            [name, username, hashedPassword])
        res.json({message: 'Admin Created successfully'})

    }   catch (error){
            res.json({message: 'Server Error'})
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

//User Register
router.post('/userlogin', async (req, res) => {
    const {firstName, lastName, userName, userStreet1, userStreet2, userCity, userState, userZipCode, userCountry, userPhoneNumber, userPassword} = req.body
    try{
        const result = await pool.query('SELECT * FROM users WHERE userName = $1',[userName])
        const userExists = result.rows

        if(userExists.length > 0){
            return res.json({message: 'User Exits'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new user
        await pool.query(`INSERT INTO users 
                                            (firstName, lastName, userName, userStreet1, userStreet2, userCity, userState, userZipCode, userCountry, userPhoneNumber, userPassword) 
                                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                            [firstName, lastName, userName, userStreet1, userStreet2, userCity, userState, userZipCode, userCountry, userPhoneNumber, hashedPassword])
        res.json({message: 'User Created Successfully'})
    }catch (error){
            res.json({message: 'Server Error'})
        }
})

//User Login
router.post('/user', async(req, res)=> {
    const { userName, password } = req.body

    try{

        const result = await pool.query('SELECT * FROM users  WHERE username = $1',[userName])
        const user = result.rows[0]

        if(!user){
            return res.json({message: 'User not found'})
        }

        //checkling password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({message: 'Invalid Credentials'})
        }
        return res.json({message: 'Login Successful'})
    }catch (error){
        return res.json({message: 'Server Error'})
    }
})

module.exports = router