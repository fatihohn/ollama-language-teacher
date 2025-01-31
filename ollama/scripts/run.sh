#!/bin/bash

# Loop until Ollama API responds with HTTP 200
until curl -sSf http://localhost:11434/api/tags > /dev/null; do
    echo "Ollama is not ready yet. Retrying..."
    sleep 2
done

ollama pull deepseek-r1:1.5b

ollama run deepseek-r1:1.5b

echo "Ollama is now running!"

