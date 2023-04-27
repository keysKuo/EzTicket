require('dotenv').config();

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';
const { exchangeDate, countTickets } = require('../utils');

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