const router = require('express').Router();

// const userRouter = require('./User')
// router.use('/users', userRouter);

// /api/categories
const CategoryRouter = require('./CategoryRouter');
router.use('/categories', CategoryRouter);
// /api/events
const EventRouter = require('./EventRouter');
router.use('/events', EventRouter);
// /api/tickets
const TicketRouter = require('./TicketRouter');
router.use('/tickets', TicketRouter);

const BusinessRouter = require('./Business');
router.use('/business', BusinessRouter);

const BookingRouter = require('./Booking');
router.use('/booking', BookingRouter);

module.exports = router;