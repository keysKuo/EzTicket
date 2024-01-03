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
    const { name, categories, author, occur_date, time, location, address, introduce, banner } = req.body
    try {
        let eventSlug = utils_API.createSlug(name)
        let payloads = {
            name: name,
            categories: categories,
            author: author,
            occur_date: occur_date,
            time: time,
            location: location,
            address: address,
            introduce: introduce,
            banner: banner,
            status: 'ready',
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
router.get('/findMany', async (req, res, next) => {
    let { status } = req.query;
    
    if(!status)
        status = 'running'
    
    let searchValue = {status: status}
    if(status == 'all') {
        searchValue = {};
    }
    
    try {
        
        let events = await API_Event.readMany(searchValue)
        if (events.length == 0) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: events })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})

router.get('/findByUser/:uid', async (req, res, next) => {
    const { uid } = req.params;
    try {
        let searchValue = {author: uid}
        let events = await API_Event.readMany(searchValue)
        if (events.length == 0) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: events })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})

router.get('/findById/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: eventExist })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})

router.get('/find/:slug', async (req, res, next) => {
    const { slug } = req.params
    try {
        let searchValue = { slug: slug }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: eventExist })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [PUT]
router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params
    const { name, status } = req.body
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
            ...req.body, slug: eventSlug
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

router.put('/switch-status/:id/:status', async (req, res, next) => {
    const { id, status } = req.params;
    
    await API_Event.update(id, {status})
        .then(() => {
            return res.status(200).json({success: true, message: 'Update trạng thái thành công'});
        })
        .catch(err => {
            return res.status(500).json({success: false, message: err});
        })
})




module.exports = router