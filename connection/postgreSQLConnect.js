const { Pool } = require('pg')
require('dotenv').config()
const AdminSchema = require('../models/admins')
const UserSchema = require('../models/user')

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT || 5432,
})

pool.connect((err, client, release) => {
    if (err) throw err
    else {
        console.log('PostgreSQL is connected')
        
        try {
            AdminSchema(client)
            UserSchema(client)
        } catch (schemaErr) {
            console.error('Schema error:', schemaErr)
        } finally {
            release()
        }
    }
})

module.exports = pool