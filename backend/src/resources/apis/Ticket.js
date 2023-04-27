const { Ticket } = require('../models');

const api = {
    create: async (payloads) => {
        return await new Ticket(payloads).save();
    },

    update: async (id, data) => {
        return await Ticket.findByIdAndUpdate(id, { $set: data });
    },

    delete: async (id) => {
        return await Ticket.findByIdAndDelete(id);
    },

    readOne: async (payloads, options) => {
        let select = (options) ? options.select : {};
        return await Ticket.findOne(payloads)
            .select(select)
            .populate({ path: 'event'})
            .lean();
    },

    readMany: async (payloads, options) => {
        let skip = (options) ? options.skip : 0;
        let limit = (options) ? options.limit : 0;
        let select = (options) ? options.select : {};
        return await Ticket.find(payloads)
            .select(select)
            .skip(skip)
            .limit(limit)
            .populate({ path: 'event'})
            .sort({ name: 1 })
            
    },

    placeOne: async (code) => {
        return await Ticket.findOneAndUpdate({code, status: 'available'}, { status: 'pending' })
    }
}

module.exports = api;

