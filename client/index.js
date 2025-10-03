// Imports.
const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const {v4: uuidv4} = require('uuid');
const {EventEmitter} = require('events');

// Environment.
require('dotenv').config();
const PORT = process.env.PORT || 4000;

// Init.
const app = express();
app.use(express.static('public'))
app.use(bodyParser.urlencoded());
const emitter = new EventEmitter();

// Program.
let channel;

(async _ => {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    channel.assertQueue('chunks', {durable: false});
    channel.assertQueue('count.reply-to', {durable: false});

    channel.consume('count.reply-to', msg => {
        emitter.emit(msg.properties.correlationId, msg);
    }, { noAck: true });

})();

// Processes a chunk of text.
app.post('/chunk', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.body);

    // TODO: Sanitize for security.
    const chunk = req.body.chunk;

    channel.sendToQueue('chunks', Buffer.from(JSON.stringify({chunks: [chunk]})));

    res.json({
        success: true,
        message: 'Sent chunk for processing!'
    });
});

// Gets the count of a word.
app.get('/word', async (req, res) => {
    // TODO: Add proper logging.
    console.log(req.query);

    // TODO: Sanitize for security.
    const word = req.query.word;

    const correlationId = uuidv4();

    emitter.once(correlationId, msg => {
        const body = JSON.parse(msg.content.toString());
        res.json(body);
    });

    channel.sendToQueue('count', Buffer.from(JSON.stringify({word: word})), {
        correlationId: correlationId,
        replyTo: 'count.reply-to'
    });
});

app.listen(PORT, _ => {
    console.log(`Client is running on port ${PORT}...`);
});
