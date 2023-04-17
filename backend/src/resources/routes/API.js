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


module.exports = router;