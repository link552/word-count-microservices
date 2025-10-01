# Word Count Microservices – Radware Demo

This repository contains three Node.js/Express microservices working together as a word count solution. Designed for a Radware demonstration, each service operates in its own Docker container and is orchestrated using Kubernetes.

***

## Architecture Overview

- **Client:** Serves user interface.
- **Word Ingestion Service:** Processes chunks of text.
- **Word Count Service:** Counts word frequency and aggregates results.

***

## Getting Started

1. **Install prerequisites:**
- [Docker](https://docs.docker.com/get-started/get-docker) (Desktop version comes with Kubernetes CLI)
- [Kubernetes CLI](https://kubernetes.io/releases/download) (`kubectl`)
- [Node.js](https://nodejs.org/en/download) (For local development)

2. **Clone this repository:**

```bash
git clone https://github.com/link552/word-count-microservices.git
cd word-count-microservices
```

***

## Installation

### Local Development

1. For word-count-service, create a `.env` file in the service's folder with the following keys:
```ini
SUPABASE_URL="https://xycylsxvymqsequpaflg.supabase.co"
SUPABASE_KEY=<KEY TO BE SUPPLIED>
```

2. In a separate console, run the client service:

```bash
cd client
npm install
node index.js
```

3. In a separate console, run the word ingestion service:

```bash
cd word-ingestion-service
npm install
node index.js
```

4. In a separate console, run the word count service:

```bash
cd word-count-service
npm install
node index.js
```

5. Open the client at [http://localhost:4000](http://localhost:4000).


***

### Kubernetes Deployment

1. Create docker images:

```bash
docker build -t client ./client
docker build -t word-ingestion-service ./word-ingestion-service
docker build -t word-count-service ./word-count-service
```

2. Setup up secrets with Kubernetes and create deployments and services:

```bash
kubectl create secret generic supabase-key --from-literal=SUPABASE_KEY=<KEY TO BE SUPPLIED>
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

3. Check status:

```bash
kubectl get pods
```

4. Open the client at [http://localhost:3000](http://localhost:3000).

## Service HTTP APIs

### Word Ingestion Service

- `POST /chunks {chunks: ["a b", "c d"]}`

### Word Count Service

- `POST /word {word: "a"}`
- `GET /word?word=a`
