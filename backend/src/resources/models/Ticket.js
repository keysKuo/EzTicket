const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ticket = new Schema({
    code: { type: String, required: true, unique: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    expiry: { type: Date, required: true },
    price: { type: Number, required: true },
    
}, 
{
    timestamp: true
})

module.exports = mongoose.model('Ticket', Ticket);