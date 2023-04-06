const mongoose = require('mongoose');
require('dotenv').config();

async function connect() {
    try {
        await mongoose.connect(
            `mongodb://localhost:27017/EzTicket`,
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