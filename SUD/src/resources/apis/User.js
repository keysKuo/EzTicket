const { User } = require('../models');

const api = {
    create: async (payloads) => {
        return await new User(payloads).save();
    },

    update: async (id, data) => {
        return await User.findByIdAndUpdate(id, { $set: data }).lean();
    },

    delete: async (id) => {
        return await User.findByIdAndDelete(id);
    },

    readOne: async (payloads, options) => {
        let select = options ? options.select : {};
        return await User.findOne(payloads).select(select).lean();
    },

    readMany: async (payloads, options) => {
        let skip = options ? options.skip : 0;
        let limit = options ? options.limit : 0;
        let select = options ? options.select : {};
        return await User.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    },
};

module.exports = api;
