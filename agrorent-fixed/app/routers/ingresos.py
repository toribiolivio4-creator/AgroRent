from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.usuario import Usuario
from ..models.lote import Lote
from ..models.ingreso import Ingreso
from ..schemas.ingreso import IngresoCreate, IngresoUpdate, IngresoOut
from .auth import get_current_user

router = APIRouter(prefix="/ingresos", tags=["Ingresos"])


@router.get("/", response_model=List[IngresoOut])
def listar_ingresos(
    lote_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Ingreso).join(Lote).filter(Lote.usuario_id == current_user.id)
    if lote_id:
        query = query.filter(Ingreso.lote_id == lote_id)
    return query.order_by(Ingreso.fecha.desc()).all()


@router.post("/", response_model=IngresoOut, status_code=201)
def crear_ingreso(
    datos: IngresoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    lote = db.query(Lote).filter(
        Lote.id == datos.lote_id, Lote.usuario_id == current_user.id
    ).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    ingreso = Ingreso(**datos.model_dump())
    db.add(ingreso)
    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.patch("/{ingreso_id}", response_model=IngresoOut)
def actualizar_ingreso(
    ingreso_id: int,
    datos: IngresoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ingreso = (
        db.query(Ingreso)
        .join(Lote)
        .filter(Ingreso.id == ingreso_id, Lote.usuario_id == current_user.id)
        .first()
    )
    if not ingreso:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(ingreso, campo, valor)
    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.delete("/{ingreso_id}", status_code=204)
def eliminar_ingreso(
    ingreso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ingreso = (
        db.query(Ingreso)
        .join(Lote)
        .filter(Ingreso.id == ingreso_id, Lote.usuario_id == current_user.id)
        .first()
    )
    if not ingreso:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    db.delete(ingreso)
    db.commit()
