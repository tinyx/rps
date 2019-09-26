FROM rust:1-slim

RUN apt-get update && \
    apt-get install -y \
    libpq-dev \
    libssl-dev \
    pkg-config \
    && \
    rm -rf /var/lib/apt/lists/* && \
    cargo install cargo-watch

WORKDIR /app/api
COPY . .
