require('dotenv').config();

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SUD_URL = process.env.SUD_URL || '';
const API_URL = process.env.API_URL || '';
const { exchangeDate, countTickets } = require('../utils');
const { upload } = require('../middlewares/multer');
const fileapis = require('../middlewares/fileapis');
const moment = require('moment');

router.get('/', async (req, res, next) => {
   
    return res.render('error', {
        layout: 'admin',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
    })
})

router.get('/profile', async (req, res, next) => {
    let id = req.session.user.business;

    let business = await fetch(API_URL + `business/findById/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }
        return {}
    })
    .catch(err => {
        return {}
    })

    return res.render('client/createProfile', {
        layout: 'admin',
        pageName: 'Hồ sơ ban tổ chức',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
        business
    })
})

router.post('/profile', async (req, res, next) => {
    const id = req.session.user._id;
    await fetch(API_URL + 'business/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({...req.body})
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            await fetch(SUD_URL + `users/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({level: 2, business: result.data._id})
            })
            .then(async rs => {
                rs = await rs.json();
                if(rs.success) {
                    req.session.user = null;
                    req.flash('success', 'Lưu hồ sơ thành công. Vui lòng đăng nhập lại');
                    return res.redirect('/login');
                }
            })
        }
    })
    .catch(err => {
        req.flash('error', err);
        
        return res.redirect('/my-ezt/profile');
    })
})

router.get('/create', checkLevel, async (req, res, next) => {
    let categories = await fetch(API_URL + 'categories/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();
        if(result.success) 
            return result.data;
    })
    .catch(err => {
        return null;
    })

    return res.render('client/createEvent', {
        layout: 'admin',
        pageName: 'Tạo sự kiện',
        categories,
        createNew: true
    })
})

router.get('/events', checkLevel, async (req, res, next) => {
    const uid = req.session.user._id;
    let events = await fetch(API_URL + `events/findByUser/${uid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return [];
    })
    .catch(err => {
        return [];
    })

    
    return res.render('client/myEvents', {
        layout: 'admin',
        pageName: 'Sự kiện của tôi',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
        events: events.map(e => {
            return {
                _id: e._id,
                name: e.name,
                banner: e.banner,
                location: e.location,
                address: e.address,
                time: e.time,
                occur_date: exchangeDate(new Date(e.occur_date)).formatDate,
                categories: e.categories,
                status: () => {
                    switch(e.status) {
                        case 'ready':
                            return `<a href="/my-ezt/request/${e._id}" class="btn btn-primary">Đăng sự kiện</a>`
                        case 'pending':
                            return '<p style="color: #F6BA6F">Chờ duyệt</p>'
                        case 'running':
                            return '<p style="color: #98D8AA">Đang chạy</p>'
                        case 'ended':
                            return '<p style="color: crimson">Đã kết thúc</p>'
                    }
                }
            }
        })
    })
})

router.get('/events/:id', checkLevel, async (req, res, next) => {
    const { id } = req.params;

    let event = await fetch(API_URL + `events/findById/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return [];
    })
    .catch(err => {
        return [];
    })

    

    let tickets = await fetch(API_URL + `tickets/find-by-event/${event._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return [];
    })
    .catch(err => {
        return [];
    })

    
    // let tickets_type = [...new Map(tickets.map(t => [t.name, t])).values()];
    let tickets_type = [];
    if(tickets.length != 0) {
        tickets_type = countTickets(tickets);

    }
 
    return res.render('client/eventPreview', {
        layout: 'admin',
        data: event,
        tickets_type: tickets_type,
        pageName: 'Thông tin sự kiện',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
    })
})

router.post('/create', upload.single('banner'), async (req, res, next) => {
    let data = req.body;
    const file = req.file;
    
    let banner = `/uploads/banner/` + file.filename;
    if(typeof data.categories == 'string') {
        data.categories = data.categories.split(',');
    }

    await fetch(API_URL + 'events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({...data, banner, author: req.session.user._id})
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            req.flash('success','Tạo sự kiện thành công');
            return res.redirect('/my-ezt/events')
        }

        req.flash('error', 'Tạo sự kiện thất bại');
        return res.redirect('/my-ezt/events');
    })
    .catch(err => {
        req.flash('error', err);
        return res.redirect('/my-ezt/events');
    })
})

router.get('/update/:id', checkLevel, async (req, res, next) => {
    const { id } = req.params;

    let event = await fetch(API_URL + `events/findById/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return [];
    })
    .catch(err => {
        return [];
    })

    let categories = await fetch(API_URL + 'categories/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();
        if(result.success) 
            return result.data;
    })
    .catch(err => {
        return null;
    })

    event.occur_date = moment(new Date(event.occur_date)).format('YYYY-MM-DD')
    
    return res.render('client/createEvent', {
        layout: 'admin',
        pageName: 'Chỉnh sửa sự kiện',
        categories, event
    })
})

router.post('/update/:id', upload.single('banner'), async (req, res, next) => {
    const { id } = req.params;

    let data = {...req.body};
    const file = req.file;
    if(file) {
        data.banner = `/uploads/banner/` + file.filename;
    }
    

    await fetch(API_URL + `events/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(async result => {
        result = await result.json();
        if(result.success) {
            req.flash('success', 'Chỉnh sửa sự kiện thành công');
            return res.redirect('/my-ezt/events')
        }

        req.flash('error', 'Chỉnh sửa sự kiện thất bại');
        return res.redirect('/my-ezt/events')
    })
    .catch(err => {
        req.flash('error', err);
            return res.redirect('/my-ezt/events')
    })

})

router.get('/add-ticket', checkLevel, async (req, res, next) => {
    const uid = req.session.user._id;
    let events = await fetch(API_URL + `events/findByUser/${uid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            return result.data;
        }

        return [];
    })
    .catch(err => {
        return [];
    })

    return res.render('client/createTicket', {
        layout: 'admin',
        pageName: 'Thêm vé',
        success: req.flash('success') || '',
        error: req.flash('error') || '',
        events
    })
})

router.get('/delete/:id', checkLevel, async (req, res, next) => {
    const { id } = req.params;

    await fetch(API_URL + `tickets/delete-by-event/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
    })
    
    await fetch(API_URL + `events/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            
            req.flash('success', 'Xóa sự kiện thành công');
            return res.redirect('/my-ezt/events')
        }

        req.flash('error', 'Xóa sự kiện thất bại');
            return res.redirect('/my-ezt/events')
    })
    .catch(err => {
        console.log(err)
        req.flash('error',  'Xóa sự kiện thất bại');
        return res.redirect('/my-ezt/events')
    })
})

router.post('/add-ticket', async (req, res, next) => {
    const data = req.body;
    
    await fetch(API_URL + 'tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...data})
    })
    .then(async result => {
        result = await result.json();
        
        if(result.success) {
            req.flash('success', 'Tạo vé thành công');
            return res.redirect('/my-ezt/add-ticket')
        }
        console.log(result)
        req.flash('error', 'Tạo vé thất bại');
        return res.redirect('/my-ezt/add-ticket')
    })
    .catch(err => {
        req.flash('error', err);
        return res.redirect('/my-ezt/add-ticket')
    })
})

router.get('/request/:id', checkLevel, async (req, res, next) => {
    const { id } = req.params;
    await fetch(API_URL + `events/switch-status/${id}/pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }

    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            req.flash("success", 'Yêu cầu đăng sự kiện thành công');
            return res.redirect('/my-ezt/events');
        }

        req.flash("error", 'Yêu cầu đăng sự kiện thất bại');
            return res.redirect('/my-ezt/events');
    }) 
    .catch(err => {
        req.flash("error", err);
        return res.redirect('/my-ezt/events');
    })
})

async function checkLevel(req, res, next) {
    if(req.session.user.level == 2) {
        next();
    }else {
        req.flash('error', 'Vui lòng điền thông tin doanh nghiệp');
        return res.redirect('/my-ezt/profile');
    }

}
module.exports = router;