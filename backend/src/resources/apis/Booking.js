const { Booking } = require('../models');

const api = {
    create: async (payloads) => {
        return await new Booking(payloads).save();
    },

    update: async (id, data) => {
        return await Booking.findByIdAndUpdate(id, { $set: data });
    },

    delete: async (id) => {
        return await Booking.findByIdAndDelete(id);
    },

    readOne: async (payloads, options) => {
        let select = (options) ? options.select : {};
        return await Booking.findOne(payloads)
            .select(select)
            .populate({ path: 'tickets customer' }).lean();
    },

    readMany: async (payloads, options) => {
        let skip = (options) ? options.skip : 0;
        let limit = (options) ? options.limit : 0;
        let select = (options) ? options.select : {};
        return await Booking.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate({ path: 'tickets customer' })
            .lean();
    }
}

module.exports = api;

