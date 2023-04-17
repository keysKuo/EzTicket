const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';

router.get('/', (req, res, next) => {
    
    const user = req.session.user || {};
    return res.render('client/index', {
        title: 'Ez Ticket',
        layout: 'secondary.hbs',
        username: user.username
    })
})

router.get('/login', (req, res, next) => {
    
    return res.render('client/login', {
        layout: 'main',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
    })
})

router.post('/login', async (req, res, next) => {
    const { email, password, check } = req.body;
    if(!check) {
        req.flash('error', 'Vui lòng xác nhận đồng ý các điều khoản');
        return res.redirect('/login');
    }

    await fetch(SUD_URL + 'users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    })
    .then(async result => {
        result = await result.json();
        // console.log(result);

        if(result.success) {
            req.session.email = email;
            return res.redirect('/verify-login');
        }

        req.flash('error', result.msg);
        return res.redirect('/login');
    })
    .catch(err => {
        return res.redirect('/error');
    })
})

router.get('/verify-login', (req, res, next) => {
    let email = req.session.email;
    
    if(!email) {
        return res.redirect('/login')
    }

    return res.render('client/otp', {
        layout: 'main',
        email: email
    });
})

router.post('/verify-login', async (req, res, next) => {
    const { code } = req.body;
    // let code = otps.join('');
    
    await fetch(SUD_URL + 'users/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({code})
    })
    .then(async result => {
        result = await result.json();
        
        if(result.success) {
            req.session.user = result.data;
            return res.status(200).send({success: true, msg: 'Đăng nhập thành công'})
        }

        // req.flash('error', result.msg);
        // return res.redirect('/verify-login');
        return res.status(404).send({success: false, msg: 'Mã xác nhận không chính xác'});
    })
    .catch(err => {
        console.log(err);
        // return res.redirect('/error');
        return res.status(500).send({success: false, msg: err})
    })
})

router.get('/event', function (req, res, next) {
    res.render('client/eventList', { title: 'Admin', layout: 'secondary' });
});

module.exports = router;