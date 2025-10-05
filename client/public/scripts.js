document.addEventListener("DOMContentLoaded", _ => {
    // Sending text chunk.
    document.getElementById('send-chunk-form').addEventListener('submit', async event => {
        event.preventDefault();

        // Default settings for word message.
        const chunkMsg = document.getElementById('chunk-msg');
        chunkMsg.style.color = 'red';
        chunkMsg.innerText = '';

        const form = event.target;
        const formData = new FormData(form);

        const params = new URLSearchParams();
        params.append('chunk', formData.get('chunk'));

        const fieldset = document.getElementById('send-chunk-set');
        const loader = document.getElementById('chunk-loader');

        // Disable form.
        fieldset.disabled = true;
        loader.style.display = 'inline-block';

        const response = await fetch(form.action, {
            method: form.method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: params
        });
        const result = await response.json();

        // Re-enable form.
        fieldset.disabled = false;
        loader.style.display = 'none';

        chunkMsg.innerText = result.message;

        // If we are not successful, leave now!
        if (!result.success) return;
        chunkMsg.style.color = 'green';
    });

    // Getting word count.
    document.getElementById('word-count-form').addEventListener('submit', async event => {
        event.preventDefault();

        // Default settings for word message.
        const wordMsg = document.getElementById('word-msg');
        wordMsg.style.color = 'red';
        wordMsg.innerText = '';

        const form = event.target;
        const formData = new FormData(form);

        const params = new URLSearchParams();
        params.append('word', formData.get('word'));

        const fieldset = document.getElementById('word-count-set');
        const loader = document.getElementById('word-loader');

        // Disable form.
        fieldset.disabled = true;
        loader.style.display = 'inline-block';

        const url = form.action + '?' + params.toString();

        const response = await fetch(url);
        const result = await response.json();

        // Re-enable form.
        fieldset.disabled = false;
        loader.style.display = 'none';

        wordMsg.innerText = result.message;

        // If we are not successful, leave now!
        if (!result.success) return;
        wordMsg.style.color = 'green';

        document.getElementById('count-num').value = result.count;

        const firstAddedDatetime = document.getElementById('first-added-datetime');
        const lastAddedDatetime = document.getElementById('last-added-datetime');
        if (result.count > 0) {
            // Substring is to truncate microseconds to milliseconds.
            firstAddedDatetime.value = result.firstAdded.substring(0, 19);
            lastAddedDatetime.value = result.lastAdded.substring(0, 19);
        } else {
            firstAddedDatetime.value = '';
            lastAddedDatetime.value = '';
        }
    });
});
