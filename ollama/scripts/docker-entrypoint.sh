#!/bin/bash

# Wait until the `ollama` command is available
while ! command -v ollama &> /dev/null; do
    echo "Waiting for ollama to be available..."
    sleep 2  # Wait for 2 seconds before checking again
done

echo "Ollama is now available!"

/app/run.sh &

ollama serve
