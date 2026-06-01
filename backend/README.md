# baba pet care — invoice PDF API

A Python FastAPI service that turns JSON into a branded PDF invoice. Designed to run on AWS Lambda behind a Function URL, but works the same way locally with `uvicorn`.

## Quick start (local)

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
export INVOICE_API_KEY=local-dev-secret
uvicorn app.main:app --reload --port 8000
```

Generate a sample invoice:

```bash
curl -X POST http://localhost:8000/invoice \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: local-dev-secret' \
  --data @tests/fixtures/sample_payload.json \
  --output /tmp/invoice.pdf && open /tmp/invoice.pdf
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
| `birthday` | ISO date `YYYY-MM-DD` | Age computed at render time. |
| `sterilization` | boolean | `true` = fixed checkbox; `false` = not-fixed checkbox. |
| `service_date` | string | Free-text, supports ranges. |
| `service_time_range` | string | e.g. `"8:00am – 8:30am"`. |
| `services` | array (1–12) | Each row: `service`, `qty`, `unit_price`. `amount` auto-computed. |
| `discount` | decimal 0–1 | Percentage. `0.5` = 50%. |
| `tip` | decimal | Dollar amount added after discount. |
| `subtotal`, `discount_amount`, `total` | decimal | Auto-computed if omitted. |
| `payment_method`, `payment_date` | string | Optional. |

Math: `subtotal = Σ(qty × unit_price)`; `discount_amount = subtotal × discount`; `total = subtotal × (1 − discount) + tip`.

Response: `application/pdf` binary.

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

The Function URL is set to `AuthType: AWS_IAM`, so plain `curl` won't work — requests must be SigV4-signed with your AWS credentials. Use the bundled helper [scripts/invoke.py](scripts/invoke.py), which uses `boto3` + `requests` to sign requests **and writes binary response bodies (PDFs) correctly** (popular `awscurl` corrupts binary by decoding it as text):

```bash
make health-deployed     # → {"ok":true}
make sample-deployed     # → generates a PDF from sample_payload.json and opens it
```

Both Make targets pull `INVOICE_URL` and `INVOICE_API_KEY` from `.env` automatically — no shell `export` required.

Your IAM identity needs `lambda:InvokeFunctionUrl` on the function. If you see HTTP 403, attach this policy to your user/role:

```json
{
  "Effect": "Allow",
  "Action": "lambda:InvokeFunctionUrl",
  "Resource": "arn:aws:lambda:us-east-1:<account-id>:function:baba-invoice-api-InvoiceFn-*"
}
```

### Auth

Two layers:

1. **AWS IAM SigV4** on the Function URL — only authorized AWS principals can invoke it.
2. **`X-API-Key` header** checked in-app by FastAPI middleware — additional shared-secret gate.

To rotate the shared key:

```bash
sam deploy --parameter-overrides ApiKey="<new-secret>"
# Also update INVOICE_API_KEY in .env to match.
```

### CORS

Function URL edge-level CORS is **not** configured (corporate SCPs in some AWS accounts block `FunctionUrlConfig.Cors`). CORS is handled at the application layer by FastAPI's `CORSMiddleware` ([app/main.py](app/main.py)), which reads the `INVOICE_CORS_ORIGINS` Lambda env var (set from the `AllowedOrigins` SAM parameter).

To add a new caller origin:

```bash
sam deploy --parameter-overrides \
  ApiKey="<your-secret>" \
  AllowedOrigins="https://babapetcare.com,http://localhost:3000,https://newdomain.com"
```

### Tear-down

```bash
sam delete --stack-name baba-invoice-api
```

### Common deploy errors

- **`Error: Failed to create changeset … [AWS::EarlyValidation::PropertyValidation]`** — corporate SCPs reject certain CloudFormation properties. The most common offender is `FunctionUrlConfig.Cors`, which this template intentionally omits. If you re-add it and hit this error, move CORS handling back to FastAPI middleware only.
- **`Image not found for ImageUri parameter`** — run `sam build` before `sam deploy`; the container image must exist in `.aws-sam/` before deploy.
- **`Parameters: [ApiKey] must have values`** — pass `--parameter-overrides ApiKey=...` or set `INVOICE_API_KEY` in `.env` so `make deploy` supplies it.
