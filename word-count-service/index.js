// Imports.
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Environment.
require('dotenv').config();
const PORT = process.env.PORT || 4002;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Init.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(express.static('public'))
app.use(bodyParser.json());

// Counts a given word.
app.post('/word', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.body);

    const word = req.body.word;

    // Persist word count.
    // IMPORTANT: Words MUST be stored in lowercase for proper tracking.
    const {error} = await supabase
        .from('words')
        .insert({word: word.toLowerCase()});

    if (error) {
        res.json({
            success: false,
            message: 'Failed to persist word count.',
        });
        return;
    }

    res.json({
        success: true,
        message: 'Stored word successfully!',
    });
});

// Gets the count of a given word.
app.get('/word', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.query);

    const word = req.query.word;

    // Query for word count.
    // IMPORTANT: Words MUST be queried in lowercase for proper tracking.
    // XXX: Is SQL injection a concern here?
    const {data, error} = await supabase.rpc('get_count', {in_word: word.toLowerCase()});

    if (error) {
        res.json({
            success: false,
            message: 'Failed to query word count.',
        });
        return;
    }

    // get_count() always returns one record.
    const record = data[0];

    // If the word has been recorded before.
    if (record.count > 0) {
        res.json({
            success: true,
            message: 'Found word count successfully!',
            count: record.count,
            firstAdded: record.first_added,
            lastAdded: record.last_added
        });
        return;
    }

    // Word not found, default.
    res.json({
        success: true,
        message: 'Word not found.',
        count: 0,
        firstAdded: null,
        lastAdded: null
    });
});

app.listen(PORT, () => {
    console.log(`Word Count Service is running on port ${PORT}...`);
});
