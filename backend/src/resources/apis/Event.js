const { Event } = require('../models');

const api = {
    create: async (payloads) => {
        return await new Event(payloads).save();
    },

    update: async (id, data) => {
        return await Event.findByIdAndUpdate(id, { $set: data });
    },

    delete: async (id) => {
        return await Event.findByIdAndDelete(id);
    },

    readOne: async (payloads, options) => {
        let select = (options) ? options.select : {};
        return await Event.findOne(payloads)
            .select(select)
            .populate({ path: 'categories author' }).lean();
    },

    readMany: async (payloads, options) => {
        let skip = (options) ? options.skip : 0;
        let limit = (options) ? options.limit : 0;
        let select = (options) ? options.select : {};
        return await Event.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({ path: 'categories author' })
            .lean();
    }
}

module.exports = api;

