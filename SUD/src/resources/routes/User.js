const router = require('express').Router();
const { createCode, sendMail, mailForm } = require('../utils');
require('dotenv').config();
const { API_USER,API_OTP } = require('../apis');
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

router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params;
    
    const { username, phone, address } = req.body;

    await API_USER.update(id, {...req.body})
        .then(user => {
            if(user) {
                return res.status(200).json({success: true, data: user, msg: 'Chỉnh sửa tài khoản thành công'});
            }

            return res.status(300).json({success: false, msg: 'Chỉnh sửa tài khoản thất bại'});
        })
        .catch(err => {
            return res.status(500).json({success: false, msg: err});
        })
} )

router.post('/generate-OTP', async (req, res, next) => {
    const { code, UserEmail } = req.body;
    
    await API_OTP.create({code, UserEmail})
        .then(otp => {
            return res.status(200).json({success: true, data: otp});
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({success: false, msg: err});
        })
})

// [POST] Confirm OTP -> /api/users/confirm-OTP
router.post('/confirm-OTP', async (req, res, next) => {
    const { code } = req.body;
    
    await API_OTP.readOne({code})
        .then(otp => {
            
            if(otp) {
                return res.status(200).json({success: true, data: otp, msg: 'Xác nhân OTP thành công'});
            }

            return res.status(404).json({success: false, msg: 'Không tìm thấy OTP'});
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({success: false, msg: err});
        })
        
})

// [POST] Recover account password -> /api/users/recover-password
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
                subject: '[EZTICKET] Tìm lại mật khẩu tài khoản',
                html: mailForm({
                    caption: 'Tìm lại mật khẩu',
                    content: ` 
                    <p><strong>Họ và tên: </strong>${user.username}</p>
                    <p><strong>Email: </strong>${user.email}</p>
                    <p><strong>Mật khẩu mới: </strong>${new_password}</p>
                    `
                })
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