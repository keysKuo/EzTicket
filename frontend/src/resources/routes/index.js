var express = require('express');
const { clientController } = require('../controllers/index');
var router = express.Router();

/* GET admin page. */
// router.get('/admin', function (req, res, next) {
//     res.render('admin/index', { title: 'Admin' });
// });

// /* GET home page. */
// router.get('/', clientController.index);
// router.get('/booking/ticketDetail', clientController.eventDetailPage);
// router.get('/booking', clientController.BookingPage);

module.exports = router;
