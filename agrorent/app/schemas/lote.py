from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LoteCreate(BaseModel):
    nombre: str
    hectareas: float
    cultivo: str
    ubicacion: Optional[str] = None
    campania: str = "2024/25"
    notas: Optional[str] = None


class LoteUpdate(BaseModel):
    nombre: Optional[str] = None
    hectareas: Optional[float] = None
    cultivo: Optional[str] = None
    ubicacion: Optional[str] = None
    campania: Optional[str] = None
    notas: Optional[str] = None


class LoteOut(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    hectareas: float
    cultivo: str
    ubicacion: Optional[str]
    campania: str
    notas: Optional[str]
    creado_en: datetime

    model_config = {"from_attributes": True}
