FROM ollama/ollama:latest

RUN apt-get update && apt-get install -y \
  curl \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app

WORKDIR /app

COPY ./scripts /app

RUN chmod +x /app/docker-entrypoint.sh
RUN chmod +x /app/run.sh

EXPOSE 11434

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]
