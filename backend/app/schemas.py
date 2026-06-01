from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


_TWO_PLACES = Decimal("0.01")


def _q(value: Decimal) -> Decimal:
    return value.quantize(_TWO_PLACES)


class PetSex(str, Enum):
    M = "M"
    F = "F"


class ServiceLine(BaseModel):
    model_config = ConfigDict(extra="forbid")

    service: str = Field(min_length=1, max_length=80)
    qty: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    amount: Decimal | None = None

    @model_validator(mode="after")
    def _fill_amount(self) -> ServiceLine:
        if self.amount is None:
            self.amount = _q(self.qty * self.unit_price)
        return self


class InvoiceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client: str = Field(min_length=1)
    contact_info: str = ""
    pet_name: str = Field(min_length=1)
    pet_sex: PetSex
    breed: str = Field(min_length=1)
    birthday: date
    sterilization: bool
    service_date: str
    service_time_range: str = ""
    services: list[ServiceLine] = Field(min_length=1, max_length=12)
    discount: Decimal = Field(default=Decimal("0"), ge=0, le=1)
    tip: Decimal = Field(default=Decimal("0.00"), ge=0)
    subtotal: Decimal | None = None
    discount_amount: Decimal | None = None
    total: Decimal | None = None
    payment_method: str = ""
    payment_date: str = ""

    @model_validator(mode="after")
    def _fill_totals(self) -> InvoiceRequest:
        subtotal = sum((line.amount for line in self.services), Decimal("0"))
        if self.subtotal is None:
            self.subtotal = _q(subtotal)
        if self.discount_amount is None:
            self.discount_amount = _q(subtotal * self.discount)
        if self.total is None:
            self.total = _q(subtotal - (subtotal * self.discount) + self.tip)
        return self
