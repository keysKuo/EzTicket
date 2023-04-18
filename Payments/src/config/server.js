const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const flash = require('flash');
const cors = require('cors');
require('dotenv').config();

const init = () => {
    app.use(cors());
    
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookie('Payment'));
    app.use(session({ cookie: { maxAge: 30000000 } }));
    app.use(flash());
    app.use(bodyParser.urlencoded({ extended: false }));
    return app;

}

module.exports = { init };