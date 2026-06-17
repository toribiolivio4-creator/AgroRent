from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class GastoCreate(BaseModel):
    lote_id: int
    fecha: date
    categoria: str
    descripcion: Optional[str] = None
    importe: float
    notas: Optional[str] = None


class GastoUpdate(BaseModel):
    fecha: Optional[date] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    importe: Optional[float] = None
    notas: Optional[str] = None


class GastoOut(BaseModel):
    id: int
    lote_id: int
    fecha: date
    categoria: str
    descripcion: Optional[str]
    importe: float
    notas: Optional[str]
    creado_en: datetime

    model_config = {"from_attributes": True}
