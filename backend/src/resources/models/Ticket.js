const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ticket = new Schema(
    {
        event: { type: Schema.Types.ObjectId, ref: 'Event' },
        code: { type: String, required: true, unique: true },
        expiry: { type: Date, required: true },
        price: { type: Number, required: true },
        status: { type: String }, // available or unavailableor soldout
    },
    {
        timestamp: true,
    },
);

module.exports = mongoose.model('Ticket', Ticket);
