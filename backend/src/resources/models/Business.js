const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Business = new Schema(
    {
        name: { type: String },
        business_type: { type: String },
        business_id: { type: String },
        tax_id: { type: String },
        email: { type: String },
        phone: { type: String },
        address: { type: String},
        
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Business', Business);