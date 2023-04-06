const { OTP } = require('../models')

const api = {
    create: async (payloads) => {
        return await new OTP(payloads).save();
    },

    update: async (id, data) => {
        return await OTP.findByIdAndUpdate(id, { $set: data });
    },

    delete: async (id) => {
        return await OTP.findByIdAndDelete(id);
    },

    readOne: async (payloads) => {
        return await OTP.findOne(payloads).lean();
    },

    readMany: async (payloads, options) => {
        let skip = options ? options.skip : 0;
        let limit = options ? options.limit : 0;
        let select = options ? options.select : {};
        return await OTP.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    },
};

module.exports = api;
