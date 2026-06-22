# baba pet care — PDF API

A Python FastAPI service that generates branded PDF documents (invoices and visit reports). Designed to run on AWS Lambda behind a Function URL, but works the same way locally with `uvicorn`.

## Quick start (local)

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
export INVOICE_API_KEY=local-dev-secret
uvicorn app.main:app --reload --port 8000
```

Generate a sample invoice or visit report:

```bash
# Invoice
curl -X POST http://localhost:8000/invoice \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: local-dev-secret' \
  --data @tests/fixtures/sample_payload.json \
  --output /tmp/invoice.pdf && open /tmp/invoice.pdf

# Visit report (single day)
curl -X POST http://localhost:8000/visit-report \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: local-dev-secret' \
  --data @tests/fixtures/visit_report_single.json \
  --output /tmp/report.pdf && open /tmp/report.pdf
```

Or use the Makefile: `make install && make dev` in one shell, `make sample` in another.

## API

### `POST /invoice`

Headers: `Content-Type: application/json`, `X-API-Key: <shared secret>`.

Request body — see [tests/fixtures/sample_payload.json](tests/fixtures/sample_payload.json) for a complete example. Fields:

| Field | Type | Notes |
|---|---|---|
| `client` | string | Required. |
| `contact_info` | string | Free-text; newlines preserved. |
| `pet_name` | string | Required. |
| `pet_sex` | `"M"` or `"F"` | Required. Renders as `Leo (M)`. |
| `breed` | string | Required. |
| `age_category` | `"junior"`, `"adult"`, or `"senior"` | Required. `junior`/`senior` appends a $5/service surcharge line automatically. |
| `sterilization` | boolean | `true` = fixed checkbox; `false` = not-fixed checkbox. |
| `service_date` | string | Free-text, supports ranges. |
| `service_time_range` | string | e.g. `"8:00am – 8:30am"`. |
| `services` | array (1–12) | Each row: `service`, `qty`, `unit_price`. `amount` auto-computed. |
| `discount` | decimal 0–1 | Percentage. `0.5` = 50%. |
| `tip` | decimal | Dollar amount added after discount. |
| `subtotal`, `discount_amount`, `total` | decimal | Auto-computed if omitted. |
| `payment_method`, `payment_date` | string | Optional. |

Math: `subtotal = Σ(qty × unit_price)`; `discount_amount = subtotal × discount`; `total = subtotal × (1 − discount) + tip`. The junior/senior surcharge is included in `services` before these totals are computed.

Response: `application/pdf` binary.

### `POST /visit-report`

Headers: `Content-Type: application/json`, `X-API-Key: <shared secret>`.

Generates a branded visit report PDF. Supports two modes via the `mode` field.

**Single-day mode** (`"mode": "single"`) — one page summarizing a single visit:

| Field | Type | Notes |
|---|---|---|
| `mode` | `"single"` | Required. |
| `pet_name` | string | Required. |
| `service_date` | string | Free-text date shown on the report. |
| `activities` | array of strings | Any of: `Walk`, `Play`, `Feeding`, `Brushing`, `Bath`, `Snuggles`, `Outdoor`. |
| `food_level` | `"well"`, `"some"`, or `"skipped"` | Required. |
| `water_level` | `"well"`, `"little"`, or `"not much"` | Required. |
| `pee_count` | integer ≥ 0 | Default `0`. |
| `poop_count` | integer ≥ 0 | Default `0`. |
| `mood` | `"happy"`, `"playful"`, `"calm"`, `"tired"`, or `"anxious"` | Required. |
| `notes` | string | Optional sitter notes; word-wrapped on the PDF. |
| `photos` | array of base64 strings (max 3) | Optional. Each entry is a base64-encoded image; rendered in a rounded photo strip. |

See [tests/fixtures/visit_report_single.json](tests/fixtures/visit_report_single.json) for a complete example.

**Multi-day mode** (`"mode": "multi"`) — a cover page followed by one card per day (2 cards/page):

| Field | Type | Notes |
|---|---|---|
| `mode` | `"multi"` | Required. |
| `pet_name` | string | Required. |
| `days` | array of day objects | Required. See below. |
| `overall_notes` | string | Shown on the cover page. |
| `photos` | array of base64 strings (max 3) | Optional cover-page photos. |

Each object in `days`:

| Field | Type | Notes |
|---|---|---|
| `date` | string | Date string shown on the card. |
| `day_label` | string | Optional label, e.g. `"Day 1"`. Shown as the card heading; `date` moves to a sub-line. |
| `activities` | array of strings | Same values as single mode. |
| `food_level` | `"well"`, `"some"`, or `"skipped"` | Required. |
| `water_level` | `"well"`, `"little"`, or `"not much"` | Required. |
| `pee_count` | integer ≥ 0 | Default `0`. |
| `poop_count` | integer ≥ 0 | Default `0`. |
| `mood` | `"happy"`, `"playful"`, `"calm"`, `"tired"`, or `"anxious"` | Required. |
| `notes` | string | Truncated at 120 characters on the day card. |

See [tests/fixtures/visit_report_multi.json](tests/fixtures/visit_report_multi.json) for a complete example.

Response: `application/pdf` binary.

### `GET /auth/check`

Authenticated (`X-API-Key` required). Returns `{"ok": true}` if the key is valid, `401` otherwise. The front-end tools hub uses this to validate a stored password without generating a PDF.

### `GET /health`

Unauthenticated. Returns `{"ok": true}`.

## Visual assets

`Caveat-Regular.ttf` ships with the repo (OFL) so the "Invoice" title and "Wutt Hmone Kyi" signature placeholder render in a real handwriting font out of the box. Procedural paws and hearts are drawn from code — no PNGs needed for the default look. The remaining drop-ins below are optional and activate automatically when present.

| Path | Purpose | Fallback |
|---|---|---|
| `assets/fonts/Caveat-Regular.ttf` | **Bundled.** Drives "Invoice" title + signature placeholder. (Google Fonts, OFL.) | — |
| `assets/signature.png` | Real Wutt Hmone Kyi handwritten signature. Transparent BG, ~800 px wide. Overrides the font placeholder. | Caveat-rendered "Wutt Hmone Kyi". |
| `assets/fonts/Signature.ttf` | Custom signature font — overrides Caveat for the placeholder only. | Caveat-Regular → Times-BoldItalic. |
| `assets/paw.png` | Single pink paw silhouette, transparent BG. Replaces the 4 procedural corner paws. | Procedural pink paws. |
| `assets/fonts/Caveat-Bold.ttf` | Bolder version of the title font. | Falls back to bundled Caveat-Regular. |
| `assets/fonts/Fredoka-Bold.ttf` | "baba" wordmark. (Google Fonts, OFL.) | Times-BoldItalic (script-feel). |
| `assets/fonts/Quicksand-Regular.ttf` | Body text. (Google Fonts, OFL.) | Helvetica. |
| `assets/fonts/Quicksand-Bold.ttf` | Labels, headers. | Helvetica-Bold. |
| `assets/fonts/Quicksand-Italic.ttf` | Italic body text. | Helvetica-Oblique. |

## Tests

```bash
pytest -q
```

Covers: schema validation, auto-compute of `amount` / `subtotal` / `discount_amount` / `total`, multi-line invoices, `format_age` edge cases, and a PDF byte-smoke test.

## Deploy to AWS Lambda

Prerequisites: AWS CLI configured, `sam` CLI installed, Docker running (for the container build).

### One-time setup

1. **Create `backend/.env`** with your deploy-time secrets and config. This file is gitignored and consumed by the Makefile — no manual `export` or shell rc edits needed.

   ```bash
   cat > .env <<'EOF'
   INVOICE_API_KEY=<your-strong-secret>
   INVOICE_URL=<set-after-first-deploy>
   DOCKER_HOST=unix:///Users/<you>/.colima/default/docker.sock
   EOF
   ```

   Notes:
   - Strong key suggestion: `openssl rand -base64 32`.
   - `DOCKER_HOST` is only needed if you use Colima instead of Docker Desktop — SAM doesn't honor Docker contexts and needs the socket path directly. Run `colima status` to confirm the path.

2. **First deploy** — interactive prompts for stack name, region, etc. SAM writes its answers to `samconfig.toml` so subsequent deploys skip the prompts.

   ```bash
   make build
   make deploy-guided   # one time, to record the stack name and region
   ```

   The `ApiKey` parameter is supplied from `.env`. Accept the defaults for the other prompts.

3. **Capture the URL** from the deploy Outputs and put it in `.env`:

   ```
   InvoiceUrl   https://<hash>.lambda-url.us-east-1.on.aws/
   ```

### Subsequent deploys

```bash
make build && make deploy
```

The Makefile auto-loads `.env` so `DOCKER_HOST`, the `ApiKey` parameter, etc. are all supplied without flags.

### Test the deployed function

The Function URL is set to `AuthType: NONE` — plain `curl` works. The browser-side invoice tool needs this, since browsers can't sign SigV4 requests:

```bash
curl https://<hash>.lambda-url.us-east-1.on.aws/health
curl -X POST https://<hash>.lambda-url.us-east-1.on.aws/invoice \
  -H 'Content-Type: application/json' \
  -H "X-API-Key: $INVOICE_API_KEY" \
  --data @tests/fixtures/sample_payload.json \
  --output /tmp/invoice.pdf
```

The bundled SigV4 helper [scripts/invoke.py](scripts/invoke.py) is still wired up via `make health-deployed` / `make sample-deployed`, and works (signatures are accepted but ignored when `AuthType=NONE`). It remains useful as a binary-safe wrapper — `awscurl` and similar tools mangle PDF bytes by decoding the response as text.

```bash
make health-deployed     # → {"ok":true}
make sample-deployed     # → generates a PDF from sample_payload.json and opens it
```

Both Make targets pull `INVOICE_URL` and `INVOICE_API_KEY` from `.env` automatically — no shell `export` required.

### Auth

Single layer: the **`X-API-Key` header** is checked in-app by FastAPI middleware. The Function URL itself is unauthenticated (`AuthType: NONE`) so the browser-side tool can call it; the shared secret is the only gate.

This means **anyone who learns the URL + key can hit the API**. Rotate aggressively if you suspect the key is leaked:

```bash
sam deploy --parameter-overrides ApiKey="<new-secret>"
# Also update INVOICE_API_KEY in .env to match.
```

If you ever need stronger auth (e.g. employee-only access), put the function behind API Gateway with a Cognito authorizer rather than re-enabling Function URL `AWS_IAM` auth — IAM auth blocks browsers entirely.

### CORS

Two layers, both with the same allowlist:

1. **Function URL edge CORS** (in [template.yaml](template.yaml) `FunctionUrlConfig.Cors`) — preflight handled by AWS infra before invoking the function. Hardcoded list; edit the template and redeploy to change.
2. **FastAPI `CORSMiddleware`** ([app/main.py](app/main.py)) — defense-in-depth. Reads the `INVOICE_CORS_ORIGINS` Lambda env var, set from the `AllowedOrigins` SAM parameter.

To add a new caller origin, update **both** — edit the `AllowOrigins` list in [template.yaml](template.yaml) and pass an updated `AllowedOrigins` parameter:

```bash
sam deploy --parameter-overrides \
  ApiKey="<your-secret>" \
  AllowedOrigins="https://babapetcare.com,https://www.babapetcare.com,http://localhost:3000,https://newdomain.com"
```

Note: `AllowMethods` on the Function URL config rejects `OPTIONS` (each value is capped at 6 chars by the AWS API; preflights are handled automatically) — list only the real methods you serve (`POST`, `GET`).

### Tear-down

```bash
sam delete --stack-name baba-invoice-api
```

### Common deploy errors

- **`Error: Failed to create changeset … [AWS::EarlyValidation::PropertyValidation]`** — corporate SCPs in some AWS accounts reject certain CloudFormation properties. The most common offender is `FunctionUrlConfig.Cors`. If you hit this, delete the `Cors` block from [template.yaml](template.yaml) and rely on FastAPI middleware only — but be aware that browsers will then get no edge-level preflight response, so the function will be invoked on every OPTIONS request and CORS errors will surface as Lambda timeouts rather than clean 403s.
- **`Image not found for ImageUri parameter`** — run `sam build` before `sam deploy`; the container image must exist in `.aws-sam/` before deploy.
- **`Parameters: [ApiKey] must have values`** — pass `--parameter-overrides ApiKey=...` or set `INVOICE_API_KEY` in `.env` so `make deploy` supplies it.
