const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const database = require('./connection/sqlconnect')

const app = express()

app.use(express.json())
app.use(cors())

database()

app.use('/', routes)

app.listen(3001, () => {
    console.log('Server runs')
})