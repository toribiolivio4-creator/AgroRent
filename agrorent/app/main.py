from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from .database import engine, Base
from .routers import auth_router, lotes_router, gastos_router, ingresos_router, rentabilidad_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroRent API",
    description="Sistema de rentabilidad por lote para productores agropecuarios",
    version="1.0.0",
)

origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in origins_env.split(",") if o.strip()] if origins_env else []
origins += ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler explícito para preflight OPTIONS
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    origin = request.headers.get("origin", "")
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Credentials": "true",
        },
    )

app.include_router(auth_router)
app.include_router(lotes_router)
app.include_router(gastos_router)
app.include_router(ingresos_router)
app.include_router(rentabilidad_router)


@app.get("/")
def root():
    return {"mensaje": "AgroRent API funcionando", "docs": "/docs"}