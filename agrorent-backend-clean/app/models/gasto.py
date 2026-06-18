from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


CATEGORIAS_GASTO = [
    "semillas",
    "fertilizantes",
    "herbicidas",
    "fungicidas",
    "combustible",
    "mano_de_obra",
    "arrendamiento",
    "maquinaria",
    "otros",
]


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    categoria = Column(String(50), nullable=False)
    descripcion = Column(String(255))
    importe = Column(Float, nullable=False)
    notas = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    lote = relationship("Lote", back_populates="gastos")
