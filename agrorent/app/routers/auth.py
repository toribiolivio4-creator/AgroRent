from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt

from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioCreate, UsuarioOut, Token, TokenData
from ..services.auth import (
    autenticar_usuario,
    crear_access_token,
    hashear_password,
    obtener_usuario_por_email,
)
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Autenticación"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    usuario = obtener_usuario_por_email(db, token_data.email)
    if usuario is None or not usuario.activo:
        raise credentials_exception
    return usuario


@router.post("/registro", response_model=UsuarioOut, status_code=201)
def registrar_usuario(datos: UsuarioCreate, db: Session = Depends(get_db)):
    if obtener_usuario_por_email(db, datos.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        hashed_password=hashear_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = autenticar_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    access_token = crear_access_token(
        data={"sub": usuario.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario}


@router.get("/me", response_model=UsuarioOut)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    return current_user
