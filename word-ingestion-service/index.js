const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        channel.assertQueue('chunks', {durable: false});
        channel.assertQueue('word', {durable: false});

        console.log('Waiting to consume messages...');

        channel.consume('chunks', msg => {
            const body = JSON.parse(msg.content.toString());

            // TODO: Add proper logging.
            console.log(body);

            const chunks = body.chunks;

            let words = [];

            chunks.forEach(chunk => {
                // Since we are tracking whole words, we don't want any special
                // characters to be included in them.
                const sanitized = chunk.replace(/[^a-zA-Z0-9 ]/g, '');

                // Replace all whitespace with a single space. This will prevent empty
                // strings in our final word set.
                const condensed = sanitized.replace(/\s+/g, ' ');

                // All words are separated by a space.
                const chunkWords = condensed.split(' ');

                words = words.concat(chunkWords);
            });

            words.forEach(async word => {
                channel.sendToQueue('word', Buffer.from(JSON.stringify({word: word})));

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
        }, {noAck: true});
    });
});
