FROM gradle:8.12-jdk21 AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
RUN gradle dependencies --no-daemon || true
COPY src ./src
RUN gradle buildFatJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN apk --no-cache add wget && adduser -D -h /app appuser
WORKDIR /app
COPY --from=builder /app/build/libs/app.jar app.jar
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
