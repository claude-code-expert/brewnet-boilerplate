FROM python:3.13-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config default-libmysqlclient-dev gcc && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends libmariadb3 && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -m appuser
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src ./src
COPY manage.py .
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')" || exit 1
CMD ["gunicorn", "src.config.wsgi:application", "--bind", "0.0.0.0:8080"]
