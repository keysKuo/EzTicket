const catchAsync = require('../utils/catchAsync');

const clientController = {
    // GET /
    index: catchAsync(async (req, res) => {
        res.render('client/index', {
            title: 'Đặt vé xem phim',
            layout: 'secondary.hbs',
        });
    }),
    eventDetailPage: catchAsync(async (req, res) => {
        res.render('client/eventDetail', {
            title: 'Chi tiết vé xem phim',
        });
    }),

    BookingPage: catchAsync(async (req, res) => {
        res.render('client/booking', {
            title: 'Đặt vé xem phim từ Sài Gòn đến Đà Lạt',
        });
    }),
};

module.exports = clientController;
