const mysql = require('mysql')
require('dotenv').config()
const AdminSchema = require('../models/admins')

const database = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

database.connect((err) => {
    if (err) throw err
    console.log('MySQL is connected')
    AdminSchema(database)
})

module.exports = database