#!/bin/bash

# Loop until Ollama API responds with HTTP 200
until curl -sSf http://localhost:11434/api/tags > /dev/null; do
    echo "Ollama is not ready yet. Retrying..."
    sleep 2
done

ollama pull $REACT_APP_AI_MODEL

ollama run $REACT_APP_AI_MODEL

echo "Ollama is now running!"

