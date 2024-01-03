const mongoose = require('mongoose');
require('dotenv').config();
const database = process.env.DATABASE || `mongodb://localhost:27017/EzTicket`

async function connect() {
    try {
        await mongoose.connect(
            database,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        );
        console.log('Connected to SUD database');
    } catch (error) {
        console.log('Fail to connect SUD database');
    }
}

module.exports = { connect };