const express = require('express');
const router = express.Router();
// 
const utils_API = require('../utils/index');
const general_API = require('../utils/general-functions');
const { API_Category, API_Event, API_Ticket } = require('../apis');
// 
const CategoryModel = require('../models/Category');


// [POST] Create a category -> /api/categories/create
router.post('/create', async (req, res, next) => {
    const { name } = req.body
    try {
        let categorySlug = utils_API.createSlug(name)
        let searchValue = { slug: categorySlug }
        let categoryExist = await CategoryModel.findOne(searchValue)
        if (categoryExist) {
            return res.status(300).json({ success: false, message: `Category ${name} existed!` })
        }
        let payloads = { name: general_API.toUppercaseFirstLetter(name), slug: categorySlug }
        let result = await API_Category.create(payloads)
        if (result) {
            return res.status(200).json({ success: true, message: "Created!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET] Get all categories -> /api/categories/all
router.get('/all', async (req, res, next) => {
    try {
        let searchValue = {}
        let categories = await API_Category.readMany(searchValue)
        if (categories.length == 0) {
            return res.status(300).json({ success: false, message: "No Category Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: categories })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET] Get category by _id
router.get('/find/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let categoryExist = await API_Category.readOne(searchValue)
        if (!categoryExist) {
            return res.status(300).json({ success: false, message: "Category does not exist!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: categoryExist })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET] Get category by name (slug)
router.get('/find-by-name/:name', async (req, res, next) => {
    const { name } = req.params
    try {
        let categorySlug = utils_API.createSlug(name)
        let searchValue = {
            slug: {
                $regex: categorySlug,
                $options: 'i'
            }
        }
        let categories = await API_Category.readMany(searchValue)
        if (categories.length == 0) {
            return res.status(300).json({ success: false, message: "No Category Data!" })
        }
        return res.status(200).json({ success: true, message: "Data Found!", data: categories })
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [PUT] Update category by _id
router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    try {
        let searchValue = { _id: id }
        let options = {
            select: {
                _id: 1
            }
        }
        let categoryExist = await API_Category.readOne(searchValue, options)
        if (!categoryExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        let categorySlug = utils_API.createSlug(name)
        let payloads = { name: name, slug: categorySlug }
        let result = await API_Category.update(id, payloads)
        if (result) {
            return res.status(200).json({ success: true, message: "Updated!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [DELETE] Delete category by _id
router.delete('/delete/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        let searchValue = { _id: id }
        let options = {
            select: {
                _id: 1
            }
        }
        let categoryExist = await API_Category.readOne(searchValue, options)
        if (!categoryExist) {
            return res.status(300).json({ success: false, message: "No Data!" })
        }
        let result = await API_Category.delete(id)
        if (result) {
            return res.status(200).json({ success: true, message: "Deleted!", data: result })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})


// error handler
router.use((req, res, next) => {
    return res.status(404).json({
        success: false,
        message: "This link is not supported!"
    })
})


module.exports = router