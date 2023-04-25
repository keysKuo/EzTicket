require('dotenv').config();

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';
const { exchangeDate } = require('../utils');

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

    await fetch(API_URL + `events/find/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let event = result.data;
            if(event) {
                event.occur_date = exchangeDate(new Date(event.occur_date));
            }
            return res.render('client/eventDetail', {
                layout: 'main',
                event
            })
        }

        return res.json(result);
    })
    .catch(err => {
        return res.json(err);
    })
})





module.exports = router;