from __future__ import annotations

import json
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.pdf.invoice import build_invoice_pdf
from app.pdf.primitives import format_age
from app.schemas import InvoiceRequest


FIXTURE = Path(__file__).parent / "fixtures" / "sample_payload.json"


def _sample() -> dict:
    return json.loads(FIXTURE.read_text())


def test_sample_payload_validates_and_computes_totals() -> None:
    req = InvoiceRequest.model_validate(_sample())
    assert req.subtotal == Decimal("25.00")
    assert req.discount_amount == Decimal("12.50")
    assert req.total == Decimal("12.50")
    assert req.services[0].amount == Decimal("25.00")


def test_extra_fields_rejected() -> None:
    payload = _sample()
    payload["unexpected"] = "nope"
    with pytest.raises(ValidationError):
        InvoiceRequest.model_validate(payload)


def test_discount_out_of_range_rejected() -> None:
    payload = _sample()
    payload["discount"] = 1.5
    with pytest.raises(ValidationError):
        InvoiceRequest.model_validate(payload)


def test_multi_line_subtotal_and_total() -> None:
    payload = _sample()
    payload["services"] = [
        {"service": "30M drop-in", "qty": 2, "unit_price": 25.00},
        {"service": "Medication admin", "qty": 2, "unit_price": 5.00},
        {"service": "Litter box scoop", "qty": 2, "unit_price": 0.00},
    ]
    payload["discount"] = 0.5
    payload["tip"] = 5.00
    req = InvoiceRequest.model_validate(payload)
    assert req.subtotal == Decimal("60.00")
    assert req.discount_amount == Decimal("30.00")
    assert req.total == Decimal("35.00")


def test_pdf_smoke_returns_bytes() -> None:
    req = InvoiceRequest.model_validate(_sample())
    pdf = build_invoice_pdf(req)
    assert isinstance(pdf, bytes)
    assert pdf.startswith(b"%PDF")
    assert len(pdf) > 3000


def test_format_age_puppy_months() -> None:
    assert format_age(date(2026, 1, 1), today=date(2026, 5, 31)) == "4mo"


def test_format_age_under_one_month() -> None:
    assert format_age(date(2026, 5, 25), today=date(2026, 5, 31)) == "<1mo"


def test_format_age_years_only() -> None:
    assert format_age(date(2020, 5, 31), today=date(2026, 5, 31)) == "6y"


def test_format_age_years_and_months() -> None:
    assert format_age(date(2024, 11, 15), today=date(2026, 5, 31)) == "1y 6mo"


def test_sterilization_false_does_not_break_render() -> None:
    payload = _sample()
    payload["sterilization"] = False
    req = InvoiceRequest.model_validate(payload)
    pdf = build_invoice_pdf(req)
    assert pdf.startswith(b"%PDF")
