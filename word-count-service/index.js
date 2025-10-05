// Imports.
const { createClient } = require('@supabase/supabase-js');
const amqp = require('amqplib/callback_api');

// Environment.
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Init.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Program.
amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        channel.assertQueue('word', {durable: false});
        channel.assertQueue('count', {durable: false});

        console.log('Waiting to consume messages...');

        channel.consume('word', async msg => {
            const body = JSON.parse(msg.content.toString());

            // TODO: Add proper logging.
            console.log(body);

            const word = body.word;

            // Persist word count.
            // IMPORTANT: Words MUST be stored in lowercase for proper tracking.
            // Words should already be validated and normalized at this point.
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
        }, {noAck: true});

        channel.consume('count', async msg => {
            const body = JSON.parse(msg.content.toString());

            // TODO: Add proper logging.
            console.log(body);

            const word = body.word;

            // Since we are tracking whole words, we don't want any special
            // characters to be included in them.
            const sanitized = word.replace(/[^a-zA-Z0-9 ]/g, '');

            // Remove all whitespace.
            const condensed = sanitized.replace(/\s+/g, '');

            // Query for word count.
            // IMPORTANT: Words MUST be queried in lowercase for proper tracking.
            const {data, error} = await supabase.rpc('get_count', {in_word: condensed.toLowerCase()});

            if (error) {
                channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({
                    success: false,
                    message: 'Failed to query word count.',
                })), {
                    correlationId: msg.properties.correlationId
                });
                return;
            }

            // get_count() always returns one record.
            const record = data[0];

            // If the word has been recorded before.
            if (record.count > 0) {
                channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({
                    success: true,
                    message: 'Found word count successfully!',
                    count: record.count,
                    firstAdded: record.first_added,
                    lastAdded: record.last_added
                })), {
                    correlationId: msg.properties.correlationId
                });
                return;
            }

            // Word not found, default.
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({
                success: true,
                message: 'Word not found.',
                count: 0,
                firstAdded: null,
                lastAdded: null
            })), {
                correlationId: msg.properties.correlationId
            });
        }, {noAck: true});
    });
});
