from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class IngresoCreate(BaseModel):
    lote_id: int
    fecha: date
    toneladas: float
    precio_por_tonelada: float
    comprador: Optional[str] = None
    notas: Optional[str] = None


class IngresoUpdate(BaseModel):
    fecha: Optional[date] = None
    toneladas: Optional[float] = None
    precio_por_tonelada: Optional[float] = None
    comprador: Optional[str] = None
    notas: Optional[str] = None


class IngresoOut(BaseModel):
    id: int
    lote_id: int
    fecha: date
    toneladas: float
    precio_por_tonelada: float
    total: float
    comprador: Optional[str]
    notas: Optional[str]
    creado_en: datetime

    model_config = {"from_attributes": True}
