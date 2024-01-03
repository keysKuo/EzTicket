const router = require('express').Router();
const { createCode, sendMail, mailForm, ticketForm } = require('../utils');
require('dotenv').config();
const { API_USER,API_OTP } = require('../apis');
const { VALIDATE_USER } = require('../validators');
const path = require('path');
const host = process.env.EMAIL_HOST;
const qrcode = require('qrcode');
const fs = require('fs');


const htmlFile = fs.readFileSync(path.join(__dirname,'ticket.html'), 'utf-8');

router.get('/', (req, res, next) => {
    return res.json({result: 'USER API'});
})

// [POST] Register account -> /api/users/register
// body: {
//     email, password, username, phone, address
// }
router.post('/register', VALIDATE_USER.register,  async (req, res, next) => {
    const body = req.body;

    await API_USER.create({...body, level: 1})
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

    if(user.level == 0) {
        return res.status(200).json({success: true, msg: 'Đăng nhập thành công', auth: user});
    }

    let code = Math.floor(Math.random() * (9999 - 1000) + 1000);
    API_OTP.create({UserEmail: user.email, code: code})

    const options = {
        from: host,
        to: user.email,
        subject: `[${code}] Mã xác nhận đăng nhập tài khoản EzTicket`,
        html: mailForm({
            caption: 'Mã xác nhận đăng nhập',
            content: ` 
            <p><strong>Email: </strong>${user.email}</p>
            <h1>${code}</h1>
            `
        })
    };

    sendMail(options, (err, info) => {
        if (err) {
            return res.status(300).json({success: false, msg: err});
        }

        // return res.status(200).json({success: true, msg: 'Gửi mail thành công'});
    })

    return res.status(200).json({success: true, msg: 'Mã đăng nhập đã được gửi đi'});

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

// [POST] Confirm OTP -> /api/users/verify-login
router.post('/verify-login', async (req, res, next) => {
    const { code } = req.body;
    
    await API_OTP.readOne({code})
        .then(async otp => {
            
            if(otp) {
                let user = await API_USER.readOne({email: otp.UserEmail})
                return res.status(200).json({success: true, data: user, msg: 'Xác nhân OTP thành công'});
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


router.get('/qrcode', async (req, res, next) => {
    let data = {
        name: 'Kuo Nhan Dung',
        age: 27,
        email:  'nkeyskuo124@gmail.com'
    }

    let code = await qrcode.toDataURL(JSON.stringify(data))
    
    const options = {
        from: host,
        to: 'nkeyskuo124@gmail.com',
        subject: '[EZTICKET] Mã QR code',
        attachDataUrls: true,
        html: mailForm({
            caption: 'Mã QR code',
            content: ` 
            <img src="${code}">
           
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

router.post('/send-ticket', async (req, res, next) => {
    const { tickets , email } = req.body;

    
    var codes = '';
    for(let i = 0; i < tickets.length; i++) {
        let tk = tickets[i];
        let data = {
            name: tk.name,
            price: tk.price,
            _id: tk._id,
            event: tk.event.name,
            status: tk.status,
            expire: tk.expire
        }
        let code = await qrcode.toDataURL(JSON.stringify(data));
        codes +=`<img src="${code}" width="200px">`;
    }

    
    const options = {
        from: host,
        to: email,
        subject: '[EZTICKET] Vé của bạn',
        attachDataUrls: true,
        html: mailForm({
            caption: 'Mã QR code',
            content: codes
            
        })
    };

    sendMail(options, (err, info) => {
        if (err) {
            return res.status(300).json({success: false, msg: err});
        }

        return res.status(200).json({success: true, msg: 'Gửi mail thành công'});
    })
})

router.get('/list', async (req, res, next) => {
    await API_USER.readMany({level: 3})
        .then(users => {
            
            if(users.length != 0) {
                return res.status(200).json({success: true, data: users})
            }

            return res.status(404).json({success: false, msg: 'Không tìm thấy tài khoản nào'});
        }) 
        .catch(err => {
            console.log(err)
            return res.status(500).json({success: false, msg: err});
        })
})


module.exports = router;