const express = require('express');
const router = express.Router();
// 
const utils_API = require('../utils/index');
const category_API = require('../utils/category-functions');
const general_API = require('../utils/general-functions');
// 
const CategoryModel = require('../models/Category');


// [POST] Create a category -> /api/categories/create
router.post('/create', async (req, res, next) => {
    const { name } = req.body
    try {
        let category_slug = utils_API.createSlug(name)
        let searchValue = { slug: category_slug }
        let categoryExist = await category_API.findCategory(searchValue)
        if (categoryExist.success == true) {
            return res.status(500).json({ success: false, message: `Category "${name}" existed!` })
        }
        if (categoryExist.code == 0) {
            return res.status(500).json(categoryExist)
        }
        if (categoryExist.code == 1) {
            let newCategory = new CategoryModel({
                name: general_API.toUppercaseFirstLetter(name),
                slug: category_slug
            })
            let result = await newCategory.save()
            if (result) {
                return res.status(200).json({ success: true, message: "Created!", data: result })
            }
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
})
// [GET] Get all categories -> /api/categories/all
router.get('/all', async (req, res, next) => {
    let searchValue = {}
    let categories = await category_API.findCategory(searchValue)
    if (categories.success == true) {
        return res.status(200).json(categories)
    }
    if (categories.code == 1) {
        return res.status(300).json(categories)
    }
    if (categories.code == 0) {
        return res.status(500).json(categories)
    }
})
// [GET] Get category by _id
router.get('/find/:id', async (req, res, next) => {
    const { id } = req.params
    let searchValue = { _id: id }
    let categoryExist = await category_API.findCategory(searchValue)
    if (categoryExist.success == true) {
        return res.status(200).json(categoryExist)
    }
    if (categoryExist.code == 1) {
        return res.status(300).json(categoryExist)
    }
    if (categoryExist.code == 0) {
        return res.status(500).json(categoryExist)
    }
})
// [GET] Get category by name (slug)
router.get('/find-by-name/:name', async (req, res, next) => {
    const { name } = req.params
    let slug = utils_API.createSlug(name)
    let searchValue = {
        slug: {
            $regex: slug,
            $options: 'i'
        }
    }
    let categoryExist = await category_API.findCategory(searchValue)
    if (categoryExist.success == true) {
        return res.status(200).json(categoryExist)
    }
    if (categoryExist.code == 1) {
        return res.status(300).json(categoryExist)
    }
    if (categoryExist.code == 0) {
        return res.status(500).json(categoryExist)
    }
})
// [PUT] Update category by _id
router.put('/update/:id', async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    let searchValue = { _id: id }
    let categoryExist = await category_API.findCategory(searchValue)
    if (categoryExist.success == true) {
        try {
            let category = categoryExist.data[0]
            let newCategorySlug = utils_API.createSlug(name)
            category.name = general_API.toUppercaseFirstLetter(name)
            category.slug = newCategorySlug
            let result = await category.save()
            if (result) {
                return res.status(200).json({ success: true, message: "Updated!", data: result })
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error })
        }
    }
    if (categoryExist.code == 1) {
        return res.status(300).json(categoryExist)
    }
    if (categoryExist.code == 0) {
        return res.status(500).json(categoryExist)
    }
})
// [DELETE] Delete category by _id
router.delete('/delete/:id', async (req, res, next) => {
    const { id } = req.params
    let searchValue = { _id: id }
    let categoryExist = await category_API.findCategory(searchValue)
    if (categoryExist.success == true) {
        try {
            let result = await CategoryModel.deleteOne(searchValue)
            return res.status(200).json({ success: true, message: "Deleted!", data: result })
        } catch (error) {
            return res.status(500).json({ success: false, message: error })
        }
    }
    if (categoryExist.code == 1) {
        return res.status(300).json(categoryExist)
    }
    if (categoryExist.code == 0) {
        return res.status(500).json(categoryExist)
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