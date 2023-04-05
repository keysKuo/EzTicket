require('dotenv').config();
const PORT = process.env.SUD_PORT || 8080;
const router = require('./resources/routes');
const app = require('./config/server').init();
const db = require('./config/db/database');

db.connect();
router(app);

app.get('/', async (req, res, next) => {
    return res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
