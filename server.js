/*
This server.js is maintained ONLY for LOCAL DEVELOPMENT (npm run dev / start).
Vercel's production environment uses /api/index.js as configured in vercel.json.
*/
require('dotenv').config();
const express = require('express');
const path = require('path');
const apiApp = require('./api/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Local static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Mount the API logic
app.use(apiApp);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[LOCAL DEV] Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
