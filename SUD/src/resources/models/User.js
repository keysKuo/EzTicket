const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        username: { type: String, required: true },
        googleId: { type: String },
        phone: { type: String, required: true },
        address: { type: String },
        // logs: [{ type: Schema.Types.ObjectId, ref: 'Log' }], // lưu tất cả mọi thứ như mua vé, hủy vé, ....
        tickets: [ { type: Schema.Types.ObjectId, ref: 'Ticket'} ],
        level: { type: Number, default: 1 }, // default là 1
    },
    {
        timestamp: true,
    },
);

module.exports = mongoose.model('User', User);
