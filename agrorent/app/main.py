from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth_router, lotes_router, gastos_router, ingresos_router, rentabilidad_router

# Crear tablas automáticamente al iniciar (en producción usar Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroRent API",
    description="Sistema de rentabilidad por lote para productores agropecuarios",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(lotes_router)
app.include_router(gastos_router)
app.include_router(ingresos_router)
app.include_router(rentabilidad_router)


@app.get("/")
def root():
    return {"mensaje": "AgroRent API funcionando", "docs": "/docs"}
