const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
    name: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

const AdminModel = mongoose.model('admins',AdminSchema)
module.exports = AdminModel