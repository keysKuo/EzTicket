const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Booking = new Schema(
    {
        tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket'}],
        payment_type: { type: String },
        total: { type: Number },
        note: { type: String},
        status: { type: String },
        customer: { type: Schema.Types.ObjectId, ref: 'User'},
        
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Booking', Booking);