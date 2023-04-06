const router = require('express').Router();
const { createCode, sendMail } = require('../utils');
require('dotenv').config();
const host = process.env.EMAIL_HOST2;
const path = require('path')

router.get('/', (req, res, next) => {
    return res.json({result: 'MAIL API'});
})

router.get('/send-email', async (req, res, next) => {
    let code = createCode(8);
    const options = {
        // thiết lập đối tượng, nội dung gửi mail
        from: host,
        to: 'nkeyskuo124@gmail.com',
        subject: 'Thông tin vé từ EzTicket',
        text: 'Xin chào Kuo Nhan Dung',
        html: `<p>Thông tin khách hàng cần tư vấn</p>
        <img src="https://img.freepik.com/free-photo/two-yellow-tickets_1101-56.jpg?1"/>  
        <ul>
            <li><strong>Họ và tên: </strong> Kuo Nhan Dung</li>
            <li><strong>Email: </strong> nkeyskuo124@gmail.com</li>
            <li><strong>Số điện thoại: </strong> 0767916592</li>
            <li><strong>Nội dung: </strong> Code của bạn : ${code} </li>
        </ul>`,
        // attachments: [{
        //     filename: 'paimon.png',
        //     path: path.join(__dirname, '../../public/images/paimon.png'),
        //     cid: 'test@img'
        // }]
    };

    return sendMail(options, (err, info) => {
        if (err) {
            return res.status(500).json({success: false, msg: 'Gửi mail thất bại', err})
        } 
        
        return res.status(200).json({success: true, msg: 'Gửi mail thành công'})
    })
})

module.exports = router;