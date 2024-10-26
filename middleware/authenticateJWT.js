const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token

    if(!token){
        return res.status(403).json({message: 'Authentication token missing'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).json({message: 'Invalid or expired token'})
        }
        req.user = decoded
        next()
    })
}
module.exports = authenticateJWT