DB_DRIVER ?= $(shell grep -E '^DB_DRIVER=' .env 2>/dev/null | cut -d= -f2 | cut -d' ' -f1 || echo "postgres")
COMPOSE_PROFILES := $(if $(filter sqlite3,$(DB_DRIVER)),,$(DB_DRIVER))

COMPOSE := DB_DRIVER=$(DB_DRIVER) COMPOSE_PROFILES=$(COMPOSE_PROFILES) docker compose

.PHONY: dev build up down logs test clean validate

dev:
	$(COMPOSE) up --build

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

test:
	$(COMPOSE) run --rm backend python -m pytest

clean:
	$(COMPOSE) down -v --rmi local

validate:
	@bash scripts/validate.sh
