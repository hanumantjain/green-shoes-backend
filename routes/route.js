const express = require('express')
const bcrypt = require('bcryptjs/dist/bcrypt')
const database = require('../connection/sqlconnect')
const router = express.Router()

//Admin Register 
router.post('/adminHome', async (req, res) => {
    const {name, username, password} = req.body
    // try{
    //     const AdminExists = await Admin.findOne({username})
    //     if(AdminExists){
    //         return res.json({message: 'Admin exists'})
    //     }

    //     //hasing the password
    //     const salt = await bcrypt.genSalt(10)
    //     const hashedPassword = await bcrypt.hash(password, salt)

    //     const newAdmin = new Admin({name, username, password:hashedPassword})
    //     await newAdmin.save()

    //     res.json({message: 'Admin Created successfully'})
    // }catch (error){
    //     res.json({message: 'Server Error'})
    // }

    try{
        const [AdminExists] = await database.promise().query('SELECT * FROM admins WHERE username =?',[username])
        if(AdminExists.length > 0){
            return res.json({message: 'Admin exists'})
        }

        // hasing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new admin
        await database.promise().query('INSERT INTO admins (name, username, password) VALUES (?, ?, ?)',[name, username, password])
        res.json({message: 'Admin Created successfully'})
    }   catch (error){
            res.json({message: 'Server Error'})
        }
    
})

//Admin Login

router.post('/admin', async (req, res) => {
    const {username, password} = req.body

    try{
        const admin = await Admin.findone({username})

        //checking username
        if(!admin){
            return res.json({message: 'Admin not found'})
        }

        //checking password
        const isMatch = await bcrypt.compare(password, username.password)
        if(!isMatch){
            return res.json({message: 'Invalid credentials'})
        }
    }catch (error){
        res.json({message: 'Server Error'})
    }
})

module.exports = router