from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Lote(Base):
    __tablename__ = "lotes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    hectareas = Column(Float, nullable=False)
    cultivo = Column(String(100), nullable=False)
    ubicacion = Column(String(200))
    campania = Column(String(20), default="2024/25")  # Ej: "2024/25"
    notas = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario", back_populates="lotes")
    gastos = relationship("Gasto", back_populates="lote", cascade="all, delete-orphan")
    ingresos = relationship("Ingreso", back_populates="lote", cascade="all, delete-orphan")
