const router = require('express').Router();

// const userRouter = require('./User')
// router.use('/users', userRouter);

// /api/categories
const CategoryRouter = require('./CategoryRouter');
router.use('/categories', CategoryRouter);
// /api/events
const EventRouter = require('./EventRouter');
router.use('/events', EventRouter);

module.exports = router;