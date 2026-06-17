from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Ingreso(Base):
    __tablename__ = "ingresos"

    id = Column(Integer, primary_key=True, index=True)
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    toneladas = Column(Float, nullable=False)
    precio_por_tonelada = Column(Float, nullable=False)
    comprador = Column(String(200))
    notas = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    lote = relationship("Lote", back_populates="ingresos")

    @property
    def total(self) -> float:
        return self.toneladas * self.precio_por_tonelada
