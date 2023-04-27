const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';
const PAYMENT_URL = process.env.PAYMENT_URL || '';
const { exchange } = require('../../../../Payments/src/resources/utils');
const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});
const { exchangeDate, countTickets } = require('../utils');

router.get('/', async (req, res, next) => {
    
    let events = await fetch(API_URL + 'events/findMany', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }
        return []
    })
    .catch(err => {
        return [];
    })

    
    const user = req.session.user || {};
    return res.render('client/index', {
        title: 'Ez Ticket',
        layout: 'secondary.hbs',
        username: user.username,
        user_id: user._id,
        events: events.map(e => {
            return {
                _id: e._id,
                name: e.name,
                categories: e.categories,
                banner: e.banner,
                occur_date: new Date(e.occur_date).toLocaleDateString('vi-vn'),
                slug: e.slug
            }
        })
    })
})

router.get('/register', async (req, res, next) => {

    return res.render('client/register', {
        layout: 'main',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
    })
})

router.post('/register', async (req, res, next) => {
    let data = JSON.stringify({...req.body});

    await fetch(SUD_URL + 'users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: data
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            req.flash('success', 'Tạo tài khoản thành công');
            return res.redirect('/login');
        }

        req.flash('error', result.msg);
        return res.redirect('/register')
    })
    .catch(err => {
        req.flash('error', err);
        return res.redirect('/register');
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

router.put('/place-ticket', async (req, res, next) => {
    const { list, total, customer } = req.body;
    
    await fetch(API_URL + `tickets/place-ticket`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({list, total, customer})
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let data = result.data;
            let booking = result.booking;
            return res.status(200).send({success: true, data, booking, msg: 'Đặt vé thành công'});
        }

        return res.status(400).send({success: false, msg: 'Đặt vé thất bại'});
    })
    .catch(err => {
        return res.status(500).send({success: false, msg: err})
    })
});

router.put('/displace-ticket', async (req, res, next) => {
    const { ids, booking } = req.body;
    
    await fetch(API_URL + `tickets/displace-ticket`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ids, booking})
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let data = result.data;
            return res.status(200).send({success: true, data, msg: 'Hủy vé thành công'});
        }

        return res.status(400).send({success: false, msg: 'Hủy vé thất bại'});
    })
    .catch(err => {
        return res.status(500).send({success: false, msg: err})
    })
});


// Customer account
// sb-4splg25583671@personal.example.com
// rsP8YWA*

router.post('/pay', async (req, res, next) => {
    const { booking_id } = req.body;
    
    // return res.json(booking_id)

    let booking = await fetch(API_URL + `booking/find-by-id/${booking_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return {};
    })
    .catch(err => {
        return {};
    })

    if(booking.status == 'done') {
        return res.status(200).json({code: 1, msg: 'Đơn hàng của bạn đã được thanh toán. Vui lòng kiểm tra email để nhận vé'})
    }

    let items = [];
    
    
    let total = await exchange('VND', 'USD', booking.total)
        .then(result => {
            if(result.success) {
                return result.data.toFixed(2).toString();
            }
        })
        .catch(err => {
            return res.status(500).json({code: 3, msg: 'Xuất hiện lỗi'});
        }) 
    

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": `http://localhost:3000/thanh-toan/${booking._id}`,
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [
                {
                    name: 'Đơn hàng EzTicket',
                    currency: 'USD',
                    price: total,
                    quantity: 1
                }
              ]
          },
          "amount": {
              "currency": "USD",
              "total": total
          },
          "description": "EzTicket Payment"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        // return res.json(payment);
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            return res.status(200).json({code: 2, url: payment.links[i].href})
            // res.redirect(payment.links[i].href);
          }
        }
    }
  });
    
})

router.get('/thanh-toan/:id', async (req, res, next) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const { id } = req.params;


    const execute_payment_json = {
      "payer_id": payerId,
    };
  
  // Obtains the transaction details from paypal
    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
          console.log(error.response);
          return res.status(500).json({success: false, error})
          throw error;
      } else {
        await fetch(API_URL + `booking/check-out/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'}
        })
        .then(async result => {
            result = await result.json();
            
            if(result.success) {
                req.data = result.data;
                next()
            }
        })
        .catch(err => {
            return res.status(500).json(err)
        })
      }
  });
}, async (req, res, next) => {
    let ids = req.data.tickets;
    const user = req.session.user || {};
    let email = '';
    if(user)
        email = req.session.user.email;
    await fetch(API_URL + 'tickets/find-many', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ids: ids})
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let tickets = result.data;
            fetch(SUD_URL + 'users/send-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({tickets, email})
            })

            return res.redirect('/');
        }

        return res.json({success: false});
    })
    .catch(err => {
        return res.json({success: false});
    })
});

router.get('/cancel', async (req, res) => {

    await fetch(API_URL + `booking/check-out/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            req.flash('success', 'Đơn hàng đã hủy');
            return res.redirect('/');
        }
    })
    .catch(err => {
        return res.status(500).json(err)
    })
});


module.exports = router;