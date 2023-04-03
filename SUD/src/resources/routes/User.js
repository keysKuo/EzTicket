const router = require('express').Router();
const { createCode, sendMail } = require('../utils');
require('dotenv').config();
const { API_USER } = require('../apis');
const { VALIDATE_USER } = require('../validators');
const path = require('path');
const host = process.env.EMAIL_HOST;

router.get('/', (req, res, next) => {
    return res.json({result: 'USER API'});
})

// [POST] Register account -> /api/users/register
// body: {
//     email, password, username, phone, address
// }
router.post('/register', VALIDATE_USER.register,  async (req, res, next) => {
    const body = req.body;

    await API_USER.create({...body, level: 1, tickets: []})
        .then(user => {
            if(user) {
                return res.status(200).json({success: true, data: user, msg: 'Tạo tài khoản thành công'});
            }
            
            return res.status(300).json({success: false, msg: 'Tạo tài khoản thất bại'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
})

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    let user = await API_USER.readOne({email});

    if (!user) {
        return res.status(300).json({success: false, msg: 'Tài khoản này không tồn tại'});
    }
    
    if (user.password != password) {
        return res.status(300).json({success: false, msg: 'Mật khẩu không chính xác'});
    }

    return res.status(200).json({success: true, data: user, msg: 'Đăng nhập thành công'});
})

// [POST] Recover account password -> /api/user/recover-password
router.post('/recover-password', async (req, res, next) => {
    const { email } = req.body;
    let user = await API_USER.readOne({email});

    if (!user) {
        return res.status(300).json({success: false, msg: 'Tài khoản này không tồn tại'});
    }

    let new_password = createCode(8);
    await API_USER.update(user._id, {password: new_password})
        .then(user => {
            const options = {
                from: host,
                to: user.email,
                subject: 'Tìm lại mật khẩu tài khoản',
                html: `
                
                <div 
                    style="width: 40%; margin: 0 auto;
                    text-align: center; font-family: 'Google Sans', Roboto, sans-serif;
                    min-height: 300px; padding: 40px 20px;
                    border-width: thin; border-style: solid; border-color: #dadce0; border-radius: 8px">

                    <img style="width: 296px;
                    aspect-ratio: auto 74 / 24;
                    height: 96px;" src="${process.env.LOGO_LINK}" />

                    <div style="
                        color: rgba(0,0,0,0.87);
                        line-height: 32px;
                        padding-bottom: 24px;
                        text-align: center;
                        word-break: break-word;
                        font-size: 24px">

                        Tìm lại mật khẩu tài khoản ${user.email}
                    </div>

                    <div style="border: thin solid #dadce0;
                        color: rgba(0,0,0,0.87);
                        line-height: 26px;
                        text-align: center;
                        word-break: break-word;
                        font-size: 18px">

                        <p><strong>Họ và tên: </strong> ${user.username}</p>
                        <p><strong>Email: </strong> ${user.email}</p>
                        <p><strong>Mật khẩu mới: </strong> ${new_password}</p>
                    </div>

                    <p>Mọi thắc mắc vui lòng liên hệ contact.ezticket@gmail.com</p>
                    <p>Hotline: 0767916592 - SUD Technology</p>
                </div>
                `
            };

            sendMail(options, (err, info) => {
                if (err) {
                    return res.status(300).json({success: false, msg: err});
                }

                return res.status(200).json({success: true, msg: 'Gửi mail thành công'});
            })
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err})
        })
    
})


router.get('/getUser/:id', (req, res, next) => {
    const { id } = req.params;
    return res.json({id, user: 'Kuo Nhan Dung'})
})

module.exports = router;