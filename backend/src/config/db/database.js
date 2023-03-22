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
        console.log('Connect Successfully');
    } catch (error) {
        console.log('Fail to connect db');
    }
}

module.exports = { connect };