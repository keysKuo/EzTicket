const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    googleId: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true},
    address: { type: String }
}, 
{
    timestamp: true
})

module.exports = mongoose.model('User', User);