const express = require('express')
const bcrypt = require('bcryptjs/dist/bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../connection/postgreSQLConnect')
const router = express.Router()

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
        res.status(200).json({message: 'User Created Successfully'})
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

        return res.status(200).json({ message: 'Login Successful' })
    } catch (error) {
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
module.exports = router