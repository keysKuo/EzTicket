// const { clientController } = require('../controllers/index');
const clientRouter = require('./Client');
const eventRouter = require('./Event');
const profileRouter = require('./Profile');

function router(app) {
    app.use('/', clientRouter);
    app.use('/events', eventRouter);
    app.use('/my-ezt', checkLogin, profileRouter);
      
}

function checkLogin(req, res, next) {
    
    if (req.session.user) {
        next();
    }
    else {
        return res.redirect('/login')
    }

}


/* GET admin page. */


// /* GET home page. */
// router.get('/', clientController.index);
// router.get('/booking/ticketDetail', clientController.eventDetailPage);
// router.get('/booking', clientController.BookingPage);

module.exports = router;
