const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const productRoutes = require('./routes/productRoutes')

const app = express()

app.use(express.json())
app.use(cors())
app.use('/', routes)
app.use('/', productRoutes)

app.listen(3001, () => {
    console.log('Server runs')
})