# Radware Full Stack Developer Candidate Task

Implement an application that satisfies the following requirements, using distinct containers for each service. The services can be written in the language of your choice.

### Back-End Word Ingestion Service

1. Provides an API to allow a client to submit payloads of text chunks.
2. Parses each submitted text chunk into a list of words.
3. For each word, sends a message to the "Word Count Service" to count its occurrences.

### Back-End Word Count Service

1. Acts as a receiver for the messages of the "Word Ingestion Service" and stores a count of total occurrences for each word.
2. Provides an API to allow a client to request a count of how many instances of a given word have been submitted.

### Front-End Client

1. Provides a page that allows a user to submit chunks of text to the "Word Ingestion Service"
2. Provides a page that allows a user to submit an individual word to the "Word Count Service" and then displays the total of how many times that word has been submitted.

### Optional requirements for bonus points

1. Use a container orchestration tool to deploy and manage the containers.
2. Use a 3rd-party database service to store the aggregated word count for the Word Count Service.
3. Use a 3rd-party messaging tool to facilitate the communication between the two back-end services.
4. Store the first and last time a word was submitted and return that along with the count in the word count API.
