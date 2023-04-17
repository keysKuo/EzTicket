const express = require('express');
const router = express.Router();
// 
const utils_API = require('../utils/index');
const general_API = require('../utils/general-functions');
const { API_Category, API_Event, API_Ticket } = require('../apis');
// 
const CategoryModel = require('../models/Category');
const EventModel = require('../models/Event');
const TicketModel = require('../models/Ticket');


// [POST]
router.post('/create', async (req, res, next) => {
    const { event, name, expire, price, number } = req.body
    try {
        let searchValue = { _id: event }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(200).json({ success: true, message: "Event does not exist!" })
        }
        let numberInt = parseInt(number)
        let payloads = []
        for (let index = 0; index < numberInt; index++) {
            payloads.push({
                event: event,
                name: name,
                code: utils_API.createCode(6),
                expire: expire,
                price: price
            })
        }
        let result = await TicketModel.insertMany(payloads)
        if (result) {
            return res.status(200).json({ success: true, message: `Created ${number} tickets`, data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET]
router.get('/all', async (req, res, next) => {
    try {
        let searchValue = {}
        let tickets = await API_Ticket.readMany(searchValue)
        if (tickets.length == 0) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", counts: tickets.length, data: tickets })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// 
router.get('/find/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let ticketExist = await API_Ticket.readOne(searchValue)
        if (!ticketExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: ticketExist })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// 
router.get('/find-by-event/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "Event does not exist! Tickets do not exist!" })
        }
        searchValue = { event: id }
        let tickets = await API_Ticket.readMany(searchValue)
        if (tickets.length == 0) {
            return res.status(300).json({ success: false, message: "No tickets for event!" })
        }
        return res.status(200).json({ success: true, message: `Data Found for event "${id}"`, counts: tickets.length, data: tickets })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [PUT]
router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params
    const { event, name, code, expire, price, status } = req.body
    try {
        let searchValue = { _id: event }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "Event does not exist!" })
        }
        searchValue = { _id: id }
        let ticketExist = await API_Ticket.readOne(searchValue)
        if (!ticketExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        if (status) {
            let statusValidation = general_API.ticketStatusChangeCheck(status)
            if (statusValidation.success == false) {
                return res.status(300).json(statusValidation)
            }
        }
        let payloads = {
            name: name,
            code: code,
            expire: expire,
            price: price,
            status: status,
        }
        let result = await API_Ticket.update(id, payloads)
        if (result) {
            return res.status(200).json({ success: true, message: "Updated!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// 
router.put('/update-by-event/:id', async (req, res, next) => {
    const { id } = req.params
    const { name, expire, price, status } = req.body
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        searchValue = { event: id }
        let tickets = await API_Ticket.readMany(searchValue)
        if (tickets.length == 0) {
            return res.status(300).json({ success: false, message: `No Tickets for "${id}"` })
        }
        if (status) {
            let statusValidation = general_API.ticketStatusChangeCheck(status)
            if (statusValidation.success == false) {
                return res.status(300).json(statusValidation)
            }
        }
        let payloads = {
            name: name,
            expire: expire,
            price: price,
            status: status
        }
        let result = await TicketModel.updateMany(searchValue, { "$set": payloads })
        if (result) {
            return res.status(200).json({ success: true, data: result })
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
        let ticketExist = await API_Ticket.readOne(searchValue)
        if (!ticketExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        let result = await API_Ticket.delete(id)
        if (result) {
            return res.status(200).json({ success: true, message: "Deleted!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// 
router.delete('/delete-by-event/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(300).json({ success: false, message: "No Event Found!" })
        }
        searchValue = { event: id }
        let result = await TicketModel.deleteMany(searchValue)
        if (result) {
            return res.status(200).json({ success: true, message: "Deleted all tickets of the Event", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})



module.exports = router