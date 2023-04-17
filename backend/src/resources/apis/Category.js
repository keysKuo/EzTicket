const { Category } = require('../models');

const api = {
    create: async (payloads) => {
        return await new Category(payloads).save();
    },

    update: async (id, data) => {
        return await Category.findByIdAndUpdate(id, { $set: data });
    },

    delete: async (id) => {
        return await Category.findByIdAndDelete(id);
    },

    readOne: async (payloads, options) => {
        let select = (options) ? options.select : {};
        return await Category.findOne(payloads)
            .select(select)
            .populate({ path: 'child' }).lean();
    },

    readMany: async (payloads, options) => {
        let skip = (options) ? options.skip : 0;
        let limit = (options) ? options.limit : 0;
        let select = (options) ? options.select : {};
        return await Category.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({ path: 'child' })
            .lean();
    }
}

module.exports = api;

