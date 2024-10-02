const { Pool } = require('pg')
require('dotenv').config()
const AdminSchema = require('../models/admins')
const UserSchema = require('../models/user')

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
})

pool.connect((err, database) => {
    if (err) throw err
    else {
        console.log('PostgreSQL is connected')
        
        AdminSchema(database)
        UserSchema(database)

        release()
    }
})

module.exports = pool