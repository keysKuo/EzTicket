require('dotenv').config();

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';
const { exchangeDate, countTickets } = require('../utils');
const default_options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json'}
}
const { fetchAPI } = require('sud-libs');


router.get('/libs', async (req, res, next) => {
    let users = await fetchAPI(SUD_URL + 'users/list', default_options, (err) => {
        return res.json(err);
    })

    return res.json(users);
})

// Event list -> /ticket/:cate
router.get('/', async (req, res, next) => {
    await fetch(API_URL + `events/findMany`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let events = result.data;
            return res.json(events)
            
        }

        return res.json(result);
    })
    .catch(err => {
        return res.json(err);
    })
})

router.get('/switch-status/:id/:status', async (req, res, next) => {
    const { id, status } = req.params;

    await fetch(API_URL + `events/switch-status/${id}/${status}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            
            return res.redirect('/my-ezt/admin');
        }
        return res.redirect('/my-ezt/admin');
    })
    .catch(err => {
        return res.redirect('/my-ezt/admin');
    })
})



// Event detail -> /ticket/:id
router.get('/:slug', async (req, res, next) => {
    const { slug } = req.params;

    let event = await fetch(API_URL + `events/find/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {         
            return result.data;
        }

        return {}
    })
    .catch(err => {
        return {}
    })

    if(event) {
        event.occur_date = exchangeDate(new Date(event.occur_date));
    }

    let tickets = await fetch(API_URL + `tickets/find-by-event/${event._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {         
            return result.data;
        }

        return {}
    })
    .catch(err => {
        return {}
    })

    let tickets_type = [];
    if(tickets.length > 0) {
        tickets_type = countTickets(tickets);
    }
    const user = req.session.user || {};
    return res.render('client/eventDetail', {
        layout: 'main',
        event, tickets_type,
        username: user.username,
        user_id: user._id
    })
})

router.get('/:slug/ticket-booking', checkLogin, async (req, res, next) => {
    const { slug } = req.params;

    let event = await fetch(API_URL + `events/find/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {         
            return result.data;
        }

        return {}
    })
    .catch(err => {
        return {}
    })

    if(event) {
        event.occur_date = exchangeDate(new Date(event.occur_date));
    }

    let tickets = await fetch(API_URL + `tickets/find-by-event/${event._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {         
            return result.data;
        }

        return {}
    })
    .catch(err => {
        return {}
    })
    
    let tickets_type = [];
    if(tickets.length > 0) {
        tickets_type = countTickets(tickets);
    }
    const user = req.session.user || {};

    return res.render('client/booking.hbs', {
        layout: 'main',
        event, tickets_type,
        username: user.username,
        email: user.email,
        phone: user.phone,
        user_id: user._id
    })
})

function checkLogin(req, res, next) {
    
    if (req.session.user) {
        next();
    }
    else {
        return res.redirect('/login')
    }

}



module.exports = router;