require('dotenv').config();
const PORT = process.env.API_PORT || 8080;
const router = require('./resources/routes');
const Log = require('./resources/models/Log');
const app = require('./config/server').init();
const db = require('./config/db/database');
const { Event, Ticket } = require('./resources/models')
db.connect();
router(app);

app.get('/', async (req, res, next) => {
    let tickets = await Ticket.find({event: '644673eb4b68a3794f88048d'})
    .sort({name: 1})

    let tickets_type = [...new Map(tickets.map(t => [t.name, t])).values()];

    return res.json(tickets_type);
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
