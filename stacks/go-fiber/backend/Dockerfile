FROM golang:1.25-alpine AS builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
RUN go mod tidy && CGO_ENABLED=1 go build -o server ./cmd/server

FROM alpine:3.21
RUN apk --no-cache add ca-certificates && \
    adduser -D -h /app appuser
WORKDIR /app
COPY --from=builder /app/server .
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=5s \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["./server"]
