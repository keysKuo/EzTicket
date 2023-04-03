const catchAsync = require('../utils/catchAsync');

const clientController = {
    // GET /
    index: catchAsync(async (req, res) => {
        res.render('client', {
            title: 'Đặt vé xe',
        });
    }),
    CheckTicketInfoPage: catchAsync(async (req, res) => {
        res.render('client/checkTicketInfo', {
            title: 'Kiểm tra đơn hàng',
        });
    }),

    BookingPage: catchAsync(async (req, res) => {
        res.render('client/booking', {
            title: 'Đặt vé xe từ Sài Gòn đến Đà Lạt',
        });
    }),
};

module.exports = clientController;
