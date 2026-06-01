from __future__ import annotations

import logging
import os
import secrets

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .pdf.invoice import build_invoice_pdf
from .schemas import InvoiceRequest


# Lambda's Python runtime only forwards WARNING+ by default; opt our app loggers
# (including app.pdf.fonts) into INFO so font-registration diagnostics reach CloudWatch.
logging.basicConfig(level=logging.INFO, force=True)
logging.getLogger("app").setLevel(logging.INFO)

API_KEY = os.environ.get("INVOICE_API_KEY")

app = FastAPI(title="baba pet care – invoice API", version="0.1.0")

# Skip CORSMiddleware in Lambda — the Function URL handles CORS at the edge.
# Stacking both produces duplicate Access-Control-Allow-Origin headers, which
# browsers reject as a CORS error even though the HTTP status is 200.
if not os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    _cors_origins = os.environ.get(
        "INVOICE_CORS_ORIGINS",
        "https://babapetcare.com,https://www.babapetcare.com,http://localhost:3000",
    ).split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _cors_origins if o.strip()],
        allow_methods=["POST", "GET", "OPTIONS"],
        allow_headers=["content-type", "x-api-key"],
    )


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if not API_KEY:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfigured: INVOICE_API_KEY not set",
        )
    if not x_api_key or not secrets.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/auth/check", dependencies=[Depends(require_api_key)])
def auth_check() -> dict[str, bool]:
    return {"ok": True}


@app.post(
    "/invoice",
    dependencies=[Depends(require_api_key)],
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
)
def create_invoice(payload: InvoiceRequest) -> Response:
    pdf_bytes = build_invoice_pdf(payload)
    safe_client = "".join(
        ch if ch.isalnum() or ch in "-_" else "_" for ch in payload.client
    )
    filename = f"invoice-{safe_client}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


handler = Mangum(app, lifespan="off")
