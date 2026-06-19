from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    String, Numeric, Integer, ForeignKey, DateTime, Enum, Text, Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.database import Base


class CategoriaGasto(str, enum.Enum):
    SEMILLAS = "semillas"
    FERTILIZANTES = "fertilizantes"
    HERBICIDAS = "herbicidas"
    COMBUSTIBLE = "combustible"
    MANO_DE_OBRA = "mano_de_obra"
    ARRENDAMIENTO = "arrendamiento"
    OTROS = "otros"


class Cultivo(str, enum.Enum):
    SOJA = "soja"
    MAIZ = "maiz"
    TRIGO = "trigo"
    GIRASOL = "girasol"
    SORGO = "sorgo"
    OTROS = "otros"


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lotes: Mapped[list["Lote"]] = relationship("Lote", back_populates="usuario")


class Lote(Base):
    __tablename__ = "lotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    hectareas: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    ubicacion: Mapped[str | None] = mapped_column(String(200))
    cultivo: Mapped[Cultivo] = mapped_column(Enum(Cultivo))
    campania: Mapped[str] = mapped_column(String(20))  # ej: "2024/25"
    descripcion: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="lotes")
    gastos: Mapped[list["Gasto"]] = relationship("Gasto", back_populates="lote")
    ingresos: Mapped[list["Ingreso"]] = relationship("Ingreso", back_populates="lote")


class Gasto(Base):
    __tablename__ = "gastos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha: Mapped[datetime] = mapped_column(DateTime)
    categoria: Mapped[CategoriaGasto] = mapped_column(Enum(CategoriaGasto))
    descripcion: Mapped[str | None] = mapped_column(String(255))
    importe: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes.id"))
    lote: Mapped["Lote"] = relationship("Lote", back_populates="gastos")


class Ingreso(Base):
    __tablename__ = "ingresos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha: Mapped[datetime] = mapped_column(DateTime)
    toneladas: Mapped[Decimal] = mapped_column(Numeric(10, 3))
    precio_por_tonelada: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    comprador: Mapped[str | None] = mapped_column(String(150))
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes.id"))
    lote: Mapped["Lote"] = relationship("Lote", back_populates="ingresos")

    @property
    def total(self) -> Decimal:
        return self.toneladas * self.precio_por_tonelada
