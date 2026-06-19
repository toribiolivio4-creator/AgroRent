from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..models import Lote, Gasto, Ingreso
from ..schemas.rentabilidad import RentabilidadLote, DashboardOut


def calcular_rentabilidad_lote(lote: Lote) -> RentabilidadLote:
    """Calcula la rentabilidad completa de un lote."""
    total_gastos = sum(g.importe for g in lote.gastos)
    total_ingresos = sum(i.toneladas * i.precio_por_tonelada for i in lote.ingresos)
    ganancia = total_ingresos - total_gastos

    ganancia_por_ha = ganancia / lote.hectareas if lote.hectareas > 0 else 0
    costo_por_ha = total_gastos / lote.hectareas if lote.hectareas > 0 else 0
    ingreso_por_ha = total_ingresos / lote.hectareas if lote.hectareas > 0 else 0
    margen = (ganancia / total_ingresos * 100) if total_ingresos > 0 else 0

    # Agrupar gastos por categoría
    gastos_cat: dict = {}
    for g in lote.gastos:
        gastos_cat[g.categoria] = gastos_cat.get(g.categoria, 0) + g.importe

    return RentabilidadLote(
        lote_id=lote.id,
        nombre=lote.nombre,
        cultivo=lote.cultivo,
        hectareas=lote.hectareas,
        campania=lote.campania,
        total_gastos=round(total_gastos, 2),
        total_ingresos=round(total_ingresos, 2),
        ganancia=round(ganancia, 2),
        ganancia_por_ha=round(ganancia_por_ha, 2),
        margen_porcentaje=round(margen, 2),
        costo_por_ha=round(costo_por_ha, 2),
        ingreso_por_ha=round(ingreso_por_ha, 2),
        gastos_por_categoria=gastos_cat,
        ranking=0,  # se asigna al ordenar
    )


def calcular_dashboard(db: Session, usuario_id: int) -> DashboardOut:
    """Calcula el dashboard completo del productor."""
    lotes = (
        db.query(Lote)
        .filter(Lote.usuario_id == usuario_id)
        .all()
    )

    if not lotes:
        return DashboardOut(
            total_ingresos=0,
            total_gastos=0,
            ganancia_neta=0,
            margen_global=0,
            total_hectareas=0,
            lotes_activos=0,
            mejor_lote="-",
            ranking=[],
        )

    rentabilidades = [calcular_rentabilidad_lote(l) for l in lotes]

    # Ordenar por ganancia por hectárea (más justo entre lotes de distinto tamaño)
    rentabilidades.sort(key=lambda r: r.ganancia_por_ha, reverse=True)
    for i, r in enumerate(rentabilidades):
        r.ranking = i + 1

    total_ingresos = sum(r.total_ingresos for r in rentabilidades)
    total_gastos = sum(r.total_gastos for r in rentabilidades)
    ganancia_neta = total_ingresos - total_gastos
    margen_global = (ganancia_neta / total_ingresos * 100) if total_ingresos > 0 else 0
    total_ha = sum(r.hectareas for r in rentabilidades)

    return DashboardOut(
        total_ingresos=round(total_ingresos, 2),
        total_gastos=round(total_gastos, 2),
        ganancia_neta=round(ganancia_neta, 2),
        margen_global=round(margen_global, 2),
        total_hectareas=total_ha,
        lotes_activos=len(lotes),
        mejor_lote=rentabilidades[0].nombre if rentabilidades else "-",
        ranking=rentabilidades,
    )
