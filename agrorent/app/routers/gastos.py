from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.usuario import Usuario
from ..models.lote import Lote
from ..models.gasto import Gasto
from ..schemas.gasto import GastoCreate, GastoUpdate, GastoOut
from .auth import get_current_user

router = APIRouter(prefix="/gastos", tags=["Gastos"])


def _verificar_lote_del_usuario(lote_id: int, usuario: Usuario, db: Session) -> Lote:
    lote = db.query(Lote).filter(Lote.id == lote_id, Lote.usuario_id == usuario.id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lote


@router.get("/", response_model=List[GastoOut])
def listar_gastos(
    lote_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = (
        db.query(Gasto)
        .join(Lote)
        .filter(Lote.usuario_id == current_user.id)
    )
    if lote_id:
        query = query.filter(Gasto.lote_id == lote_id)
    return query.order_by(Gasto.fecha.desc()).all()


@router.post("/", response_model=GastoOut, status_code=201)
def crear_gasto(
    datos: GastoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _verificar_lote_del_usuario(datos.lote_id, current_user, db)
    gasto = Gasto(**datos.model_dump())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.patch("/{gasto_id}", response_model=GastoOut)
def actualizar_gasto(
    gasto_id: int,
    datos: GastoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    gasto = (
        db.query(Gasto)
        .join(Lote)
        .filter(Gasto.id == gasto_id, Lote.usuario_id == current_user.id)
        .first()
    )
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(gasto, campo, valor)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.delete("/{gasto_id}", status_code=204)
def eliminar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    gasto = (
        db.query(Gasto)
        .join(Lote)
        .filter(Gasto.id == gasto_id, Lote.usuario_id == current_user.id)
        .first()
    )
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    db.delete(gasto)
    db.commit()
