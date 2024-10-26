const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOptions))
app.use(cookieParser())
app.use('/', routes)

app.listen(3001, () => {
    console.log('Server runs')
})