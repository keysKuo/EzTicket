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
        console.log('EzTicket - Connected');
    } catch (error) {
        console.log('Fail to connect EzTicket database');
    }
}

module.exports = { connect };