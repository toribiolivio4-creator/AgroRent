from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.usuario import Usuario
from ..models.lote import Lote
from ..schemas.lote import LoteCreate, LoteUpdate, LoteOut
from .auth import get_current_user

router = APIRouter(prefix="/lotes", tags=["Lotes"])

LIMITE_LOTES_BASICO = 5


def _get_lote_del_usuario(lote_id: int, usuario: Usuario, db: Session) -> Lote:
    lote = db.query(Lote).filter(Lote.id == lote_id, Lote.usuario_id == usuario.id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lote


@router.get("/", response_model=List[LoteOut])
def listar_lotes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return db.query(Lote).filter(Lote.usuario_id == current_user.id).all()


@router.post("/", response_model=LoteOut, status_code=201)
def crear_lote(
    datos: LoteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Validar límite del plan básico
    if current_user.plan == "basico":
        total = db.query(Lote).filter(Lote.usuario_id == current_user.id).count()
        if total >= LIMITE_LOTES_BASICO:
            raise HTTPException(
                status_code=403,
                detail=f"Plan básico permite hasta {LIMITE_LOTES_BASICO} lotes. Actualizá tu plan.",
            )

    lote = Lote(**datos.model_dump(), usuario_id=current_user.id)
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return lote


@router.get("/{lote_id}", response_model=LoteOut)
def obtener_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return _get_lote_del_usuario(lote_id, current_user, db)


@router.patch("/{lote_id}", response_model=LoteOut)
def actualizar_lote(
    lote_id: int,
    datos: LoteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    lote = _get_lote_del_usuario(lote_id, current_user, db)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(lote, campo, valor)
    db.commit()
    db.refresh(lote)
    return lote


@router.delete("/{lote_id}", status_code=204)
def eliminar_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    lote = _get_lote_del_usuario(lote_id, current_user, db)
    db.delete(lote)
    db.commit()
