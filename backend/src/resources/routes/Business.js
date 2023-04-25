const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const { API_Event } = require('../apis');

router.post('/save', async (req, res, next) => {

    const data = req.body;
    let business = await Business.findOne({tax_id: data.tax_id});
    
    if(business) {
        await Business.findByIdAndUpdate(business._id, data)
        return res.status(200).json({success: true, data: business});
    }else {
        await new Business(data).save();
        return res.status(200).json({success: true, data: business});
    }

    return res.status(500).json({success: false, msg: 'Error'});
})

router.get('/findById/:id', async (req, res, next) => {
    const { id } = req.params;

    await Business.findById(id).lean()
        .then(business => {
            if(business)
                return res.status(200).json({success: true, data: business})
            return res.status(404).json({success: false, data: business})
        })
        .catch(err => {
            return res.status(500).json({success: false, err})
        })
})

module.exports = router;
