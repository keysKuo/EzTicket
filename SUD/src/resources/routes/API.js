const router = require('express').Router();
const userRouter = require('./User')
const mailRouter = require('./Mail');

router.use('/users', userRouter);
router.use('/mail', mailRouter);

module.exports = router;