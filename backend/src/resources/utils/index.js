const nodemailer = require('nodemailer');
const slugify = require('slugify');
const { uuid } = require('uuidv4');
require('dotenv').config();

module.exports.sendMail = (options, callback) => {
    let nodeMailer = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_HOST,
            pass: process.env.PASSWORD_HOST,
        }
    })

    nodeMailer.sendMail(options, callback);
}

module.exports.createSlug = (str) => {
    return slugify(str + '', {
        replacement: '-',
        remove: false,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true,
    })
}

module.exports.createCode = (length) => {
    return uuid().substring(0, length);
}

module.exports.catchAsync = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch((error) => res.status(404).render('error', { layout: false, error }));
}