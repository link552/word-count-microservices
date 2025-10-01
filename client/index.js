// Imports.
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Environment.
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const INGESTION_PORT = process.env.INGESTION_PORT || 4001;
const COUNT_PORT = process.env.COUNT_PORT || 4002;

// Init.
const app = express();
app.use(express.static('public'))
app.use(bodyParser.urlencoded());

// Processes a chunk of text.
app.post('/chunk', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.body);

    // TODO: Sanitize for security.
    const chunk = req.body.chunk;

    try {
        const response = await axios.post(`http://localhost:${INGESTION_PORT}/chunks`, {chunks: [chunk]});
        res.json(response.data);
    } catch (error) {
        res.json({
            success: false,
            message: 'Failed to process chunk.'
        });
    }
});

// Gets the count of a word.
app.get('/word', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.query);

    // TODO: Sanitize for security.
    const word = req.query.word;

    try {
        const response = await axios.get(`http://localhost:${COUNT_PORT}/word?word=${word}`);
        res.json(response.data);
    } catch (error) {
        res.json({
            success: false,
            message: 'Failed to get word count.'
        });
    }
});

app.listen(PORT, _ => {
    console.log(`Client is running on port ${PORT}...`);
});
