const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const pool = require('./connection/postgreSQLConnect')

const app = express()

app.use(express.json())
app.use(cors())

pool()

app.use('/', routes)

app.listen(3001, () => {
    console.log('Server runs')
})