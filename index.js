const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
// const AdminModel = require('./models/admins')
const routes = require('./routes/route')

const app = express()

app.use(express.json())
app.use(cors())

mongoose.connect('mongodb://127.0.0.1:27017/GreenShoes')

app.use('/', routes)
// app.post('/admin', (req, res) => {
//     const {username, password} = req.body
//     AdminModel.findOne({username:username})
//     .then(user => {
//         if(user){
//             if(user.password === password){
//                 res.json("Success")
//             }else{
//                 res.json("Enmail or password does not matches")
//             }
//         }else{
//             res.json('Enmail or password does not matches')
//         }
        
//     })
// })

// app.post('/adminHome', (req, res) => {
//     AdminModel.create(req.body)
//     .then(admins => res.json(admins))
//     .catch(err => res.json(err))
// })

app.listen(3001, () => {
    console.log('Server runs')
})