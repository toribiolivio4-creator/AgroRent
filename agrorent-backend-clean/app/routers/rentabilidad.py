from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.rentabilidad import DashboardOut, RentabilidadLote
from ..services.rentabilidad import calcular_dashboard, calcular_rentabilidad_lote
from ..models.lote import Lote
from fastapi import HTTPException
from .auth import get_current_user

router = APIRouter(prefix="/rentabilidad", tags=["Rentabilidad"])


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Dashboard completo con ranking de todos los lotes."""
    return calcular_dashboard(db, current_user.id)


@router.get("/lote/{lote_id}", response_model=RentabilidadLote)
def rentabilidad_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Rentabilidad detallada de un lote específico."""
    lote = (
        db.query(Lote)
        .filter(Lote.id == lote_id, Lote.usuario_id == current_user.id)
        .first()
    )
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    resultado = calcular_rentabilidad_lote(lote)
    resultado.ranking = 1
    return resultado
