const { API_USER } = require('../apis');

const validator = {
    register: async (req, res, next) => {
        const { email, password, password2, username, phone, address } = req.body;    
        let user = await API_USER.readOne({email});

        if (user) {
            return res.status(300).json({success: false, msg: 'Email này đã được sử dụng'});
        }

        if (phone.length != 10) {
            return res.status(300).json({success: false, msg: 'Số điện thoại phải có 10 chữ số'});
        }

        if (password.length < 8) {
            return res.status(300).json({success: false, msg: 'Mật khẩu phải có ít nhất 8 ký tự'});
        }

        if(password != password2) {
            return res.status(300).json({success: false, msg: 'Mật khẩu không trùng khớp'});
        }

        next();
    },

    
}

module.exports = validator;