from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: str
    plan: str
    activo: bool
    creado_en: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioOut


class TokenData(BaseModel):
    email: Optional[str] = None
