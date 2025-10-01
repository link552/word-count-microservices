// Imports.
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Environment.
require('dotenv').config();
const PORT = process.env.PORT || 4001;
const COUNT_PORT = process.env.COUNT_PORT || 4002;

// Init.
const app = express();
app.use(express.static('public'))
app.use(bodyParser.json());

// Processes a payload of chunk texts.
app.post('/chunks', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.body);

    const chunks = req.body.chunks;
    let words = [];

    chunks.forEach(chunk => {
        // Since we are tracking whole words, we don't want any special
        // characters to be included in them.
        let sanitized = chunk.replace(/[^a-zA-Z0-9 ]/g, '');

        // Replace all whitespace with a single space. This will prevent empty
        // strings in our final word set.
        let condensed = sanitized.replace(/\s+/g, ' ');

        // All words are separated by a space.
        let chunkWords = condensed.split(' ');

        words = words.concat(chunkWords);
    });

    // TODO: Consider strategies for large ingestion.
    //
    // If expected to ingest large datasets (thousands of words), we may
    // want to implement a queue whereby the ingestion service can process
    // words on it's own time.

    words.forEach(async word => {
        await axios.post(`http://localhost:${COUNT_PORT}/word`, {word: word});

        // TODO: Handle failed posts.
        //
        // Since we are posting many words, we may want to return a list of
        // which words failed.
        //
        // Another option would be to show the users a progress bar so they
        // can see the progress of their words being processed, perhaps even
        // prompting them if a word fails, granting them the option to retry
        // if necessary.
    });

    res.json({
        success: true,
        message: 'Processed text chunks successfully!'
    });
});

app.listen(PORT, () => {
    console.log(`Word Ingestion Service is running on port ${PORT}...`);
});
