const express = require('express');
const router = express.Router();
// // 
// const utils_API = require('../utils/index');
// const category_API = require('../utils/category-functions');
// const event_API = require('../utils/event-functions');
// const general_API = require('../utils/general-functions');
// const apiEvent = require('../apis/Event');
// // 
// const CategoryModel = require('../models/Category');
// const EventModel = require('../models/Event');
// const { API_Event } = require('../apis')

// // [GET]
// router.post('/create', async (req, res, next) => {
//     const { name, category_id, author_id, occur_date, location, address, introduce, banner } = req.body
//     let eventSlug = utils_API.createSlug(name)

//     await API_Event.create(
//         {...req.body, slug: eventSlug}
//     )
// })




module.exports = router