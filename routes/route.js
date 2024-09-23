const express = require('express')
const bcrypt = require('bcryptjs/dist/bcrypt')
const database = require('../connection/sqlconnect')
const router = express.Router()

//Admin Register 
router.post('/adminHome', async (req, res) => {
    const {name, username, password} = req.body

    try{
        const [AdminExists] = await database.promise().query('SELECT * FROM admins WHERE username =?',[username])
        if(AdminExists.length > 0){
            return res.json({message: 'Admin exists'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new admin
        await database.promise().query('INSERT INTO admins (name, username, password) VALUES (?, ?, ?)',[name, username, hashedPassword])
        res.json({message: 'Admin Created successfully'})
    }   catch (error){
            res.json({message: 'Server Error'})
        }
    
})

//Admin Login
router.post('/admin', async (req, res) => {
    const {username, password} = req.body

    try{
        const [AdminExists] = await database.promise().query('SELECT * FROM admins WHERE username =?',[username])

        //checking username
        if(!admin){
            return res.json({message: 'Admin not found'})
        }

        //checking password
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch){
            return res.json({message: 'Invalid credentials'})
        }
    }catch (error){
        res.json({message: 'Server Error'})
    }
})

//User Register
router.post('/userlogin', async (req, res) => {
    const {firstName, lastName, userName, address, phoneNumber, password} = req.body
    try{
        const [UserExists] = await database.promise().query('SELECT * FROM users WHERE userName =?',[userName])
        if(UserExists.length > 0){
            return res.json({message: 'User Exits'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new user
        await database.promise().query(`INSERT INTO users 
                                            (firstName, lastName, userName, address, phoneNumber, password) 
                                            VALUES (?, ?, ?, ?, ?, ?)`,
                                            [firstName, lastName, userName, address, phoneNumber, hashedPassword])
        res.json({message: 'User Created Successfully'})
    }catch (error){
            res.json({message: 'Server Error'})
        }
})

//User Login
router.post('/user', async(req, res)=> {
    const { userName, password } = req.body

    try{

        const [UserExists] = await database.promise.query('SELECT * FROM users  WHERE username =?',[userName])
        if(!user){
            return res.json({message: 'User not found'})
        }

        //checkling password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({message: 'Invalid Credentials'})
        }
    }catch (error){
        return res.json({message: 'Server Error'})
    }
})

module.exports = router