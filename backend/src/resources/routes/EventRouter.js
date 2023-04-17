const express = require('express');
const router = express.Router();
// 
const utils_API = require('../utils/index');
const general_API = require('../utils/general-functions');
const { API_Category, API_Event, API_Ticket } = require('../apis');
// 
const CategoryModel = require('../models/Category');
const EventModel = require('../models/Event');


// [POST]
router.post('/create', async (req, res, next) => {
    const { name, categories, author, occur_date, location, address, introduce, banner } = req.body
    try {
        let eventSlug = utils_API.createSlug(name)
        let payloads = {
            name: name,
            categories: categories,
            author: author,
            occur_date: occur_date,
            location: location,
            address: address,
            introduce: introduce,
            banner: banner,
            slug: eventSlug
        }
        let result = await API_Event.create(payloads)
        if (result) {
            return res.status(200).json({ success: true, message: "Created!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET]
router.get('/all', async (req, res, next) => {
    try {
        let searchValue = {}
        let events = await API_Event.readMany(searchValue)
        if (events.length == 0) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: events })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [PUT]
router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params
    const { name, categories, author, occur_date, location, address, introduce, banner, status } = req.body
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        if (status) {
            let statusValidation = general_API.eventStatusChangeCheck(eventExist.status, status)
            if (statusValidation.success == false) {
                return res.status(300).json(statusValidation)
            }
        }
        let eventSlug
        if (name) {
            eventSlug = utils_API.createSlug(name)
        }
        let payloads = {
            name: name,
            categories: categories,
            author: author,
            occur_date: occur_date,
            location: location,
            address: address,
            introduce: introduce,
            banner: banner,
            status: status,
            slug: eventSlug
        }
        let result = await API_Event.update(id, payloads)
        if (result) {
            return res.status(200).json({ success: true, message: "Updated!", data: result })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error })
    }
})
// [DELETE] 
router.delete('/delete/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        let result = await API_Event.delete(id)
        if (result) {
            return res.status(200).json({ success: true, message: "Deleted!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})



module.exports = router