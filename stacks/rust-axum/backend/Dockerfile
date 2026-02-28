FROM rust:1.88 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main(){}" > src/main.rs && cargo build --release && rm -rf src
COPY . .
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -m appuser
WORKDIR /app
COPY --from=builder /app/target/release/backend .
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["./backend"]
