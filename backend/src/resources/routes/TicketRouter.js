const express = require('express');
const router = express.Router();
// 
const utils_API = require('../utils/index');
const general_API = require('../utils/general-functions');
const { API_Category, API_Event, API_Ticket, API_Booking } = require('../apis');
// 
const CategoryModel = require('../models/Category');
const EventModel = require('../models/Event');
const TicketModel = require('../models/Ticket');


// [POST]
router.post('/create', async (req, res, next) => {
    const { event, name, expire, price, status, number } = req.body
    try {
        let searchValue = { _id: event }
        let eventExist = await API_Event.readOne(searchValue)
        if (!eventExist) {
            return res.status(200).json({ success: true, message: "Event does not exist!" })
        }
        let numberInt = parseInt(number)
        let payloads = []
        let code = utils_API.createCode(6);
        for (let index = 0; index < numberInt; index++) {
            payloads.push({
                event: event,
                name: name,
                code: code,
                expire: expire,
                price: price,
                status: status
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

router.post('/find-many', async (req, res, next) => {
    const { ids } = req.body;

    await API_Ticket.readMany({_id: { $in: ids }}, {})
        .then(tickets => {
            if(tickets.length > 0) {
                return res.status(200).json({success: true, data: tickets});
            }
            return res.status(404).json({success: false, msg: 'Không tìm thấy vé'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
})


router.put('/place-ticket', async (req, res, next) => {
    const { list, total, customer } = req.body;
    
    let error = false;
    var result = [];
    for(let i = 0; i < list.length; i++) {
        let tickets = await API_Ticket.readMany({code: list[i].code, status: 'available'}, {
            limit: list[i].quantity
        })
        
        if(tickets.length < list[i].quantity) {
            error = true;
            break;
        }

        tickets.forEach(tk => {
            tk.status = 'pending';
            tk.save();
            result.push(tk);
        })
    }

    let booking = await API_Booking.create({
        tickets: result,
        payment_type: 'Paypal',
        total: total,
        status: 'pending',
        customer: customer
    })

    
    
    if(error == true) {
        return res.status(400).json({ success: false, message: "Không đủ vé" })
    }
    if(booking)
        return res.status(200).json({ success: true, message: "Data Found!", data: result, booking: booking })
})

router.put('/displace-ticket/', async (req, res, next) => {
    const { ids, booking } = req.body;
    try {
        await API_Booking.readOne({_id: booking._id})
            .then(async booking => {
                if(booking) {
                    if(booking.status == 'pending') {
                        await API_Booking.delete(booking._id);

                        let tickets = await API_Ticket.readMany({_id: { $in: ids }}, {});
        
                        if(tickets.length == 0) {
                            return res.status(400).json({ success: false, message: "Không đủ vé" })
                        }

                        tickets.forEach(tk => {
                            tk.status = 'available';
                            tk.save();
                        })
                    return res.status(200).json({ success: true, message: "Data Found!", data: tickets })
                }
                
                
                    return res.status(400).json({ success: false, message: "Data Found!", data: tickets })
                }


            })
            

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
    const { event, name, expire, price, status } = req.body
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