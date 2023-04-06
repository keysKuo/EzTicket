const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Log = new Schema({
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    note: { type: String },
}, {
    timestamps: true
})

module.exports = mongoose.model('Log', Log);


