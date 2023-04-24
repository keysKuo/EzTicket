// const { clientController } = require('../controllers/index');
const clientRouter = require('./Client');
const eventRouter = require('./Event');

function router(app) {
    app.use('/', clientRouter);
    app.use('/events', eventRouter);
      
}
/* GET admin page. */


// /* GET home page. */
// router.get('/', clientController.index);
// router.get('/booking/ticketDetail', clientController.eventDetailPage);
// router.get('/booking', clientController.BookingPage);

module.exports = router;
