const express = require('express');
const { API_Booking, API_Ticket } = require('../apis');
const router = express.Router();

router.get('/find-by-id/:id', async (req, res, next) => {
    const { id } = req.params;

    await API_Booking.readOne({_id: id})
        .then(booking => {
            if(booking) {
                return res.status(200).json({success: true, data: booking});
            }

            return res.status(404).json({success: false, msg: 'Không tìm thấy đơn nào'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
})

router.put('/check-out/:id', async (req, res, next) => {
    const { id } = req.params;

    await API_Booking.update(id, {  status: 'done' })
        .then(async booking => {
            if(booking) {
                let tickets = booking.tickets;
                
                tickets.forEach(async tk => {
                    await API_Ticket.update(tk._id, {status: 'ready'});
                })
                return res.status(200).json({success: true, data: booking});
            }

            return res.status(404).json({success: false, msg: 'Không tìm thấy đơn nào'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
})

router.put('/cancel/:id', async (req, res, next) => {
    const { id } = req.params;

    await API_Booking.delete(id)
        .then(booking => {
            if(booking) {
                let tickets = booking.tickets;
                tickets.forEach(async tk => {
                    await API_Ticket.update(tk._id, {status: 'available'});
                })
                return res.status(200).json({success: true, data: booking});
            }

            return res.status(404).json({success: false, msg: 'Không tìm thấy đơn nào'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
})

module.exports = router;