from pydantic import BaseModel
from typing import List, Dict


class RentabilidadLote(BaseModel):
    lote_id: int
    nombre: str
    cultivo: str
    hectareas: float
    campania: str
    total_gastos: float
    total_ingresos: float
    ganancia: float
    ganancia_por_ha: float
    margen_porcentaje: float
    costo_por_ha: float
    ingreso_por_ha: float
    gastos_por_categoria: Dict[str, float]
    ranking: int


class DashboardOut(BaseModel):
    total_ingresos: float
    total_gastos: float
    ganancia_neta: float
    margen_global: float
    total_hectareas: float
    lotes_activos: int
    mejor_lote: str
    ranking: List[RentabilidadLote]
