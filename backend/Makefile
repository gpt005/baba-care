.PHONY: venv install dev test sample build deploy clean

PY ?= python3.12
VENV := .venv
ACT := $(VENV)/bin/activate

# Auto-load INVOICE_API_KEY (and any other vars) from .env if present.
# .env is gitignored — local secret, not committed.
ifneq (,$(wildcard .env))
include .env
export
endif

INVOICE_API_KEY ?= local-dev-secret

venv:
	$(PY) -m venv $(VENV)

install: venv
	. $(ACT) && pip install -r requirements-dev.txt

dev:
	. $(ACT) && INVOICE_API_KEY=$(INVOICE_API_KEY) uvicorn app.main:app --reload --port 8000

test:
	. $(ACT) && pytest -q

sample:
	. $(ACT) && curl -sS -X POST http://localhost:8000/invoice \
		-H 'Content-Type: application/json' \
		-H 'X-API-Key: $(INVOICE_API_KEY)' \
		--data @tests/fixtures/sample_payload.json \
		--output /tmp/invoice.pdf && open /tmp/invoice.pdf

build:
	sam build

deploy:
	sam deploy --parameter-overrides 'ApiKey=$(INVOICE_API_KEY)' --no-confirm-changeset

deploy-guided:
	sam deploy --guided --parameter-overrides 'ApiKey=$(INVOICE_API_KEY)'

# Hit the deployed Lambda URL via SigV4-signed Python helper (binary-safe).
sample-deployed:
	. $(ACT) && python scripts/invoke.py POST /invoice \
		--data @tests/fixtures/sample_payload.json \
		--output /tmp/lambda-invoice.pdf && open /tmp/lambda-invoice.pdf

health-deployed:
	. $(ACT) && python scripts/invoke.py GET /health

clean:
	rm -rf $(VENV) .pytest_cache .ruff_cache __pycache__ .aws-sam
