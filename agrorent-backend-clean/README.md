# AgroRent — Backend API

Sistema de rentabilidad por lote para productores agropecuarios.

## Stack
- **Python 3.11+** + **FastAPI**
- **PostgreSQL** + **SQLAlchemy 2.0**
- **JWT** para autenticación
- **Alembic** para migraciones

## Instalación

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos de PostgreSQL

# 4. Crear la base de datos en PostgreSQL
createdb agrorent

# 5. Levantar el servidor
uvicorn app.main:app --reload
```

La API queda en: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs

## Endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/registro | Registrar nuevo usuario |
| POST | /auth/login | Login (devuelve JWT) |
| GET  | /auth/me | Perfil del usuario actual |

### Lotes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | /lotes/ | Listar todos los lotes |
| POST | /lotes/ | Crear nuevo lote |
| GET  | /lotes/{id} | Detalle de un lote |
| PATCH | /lotes/{id} | Actualizar lote |
| DELETE | /lotes/{id} | Eliminar lote |

### Gastos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | /gastos/?lote_id=X | Listar gastos (filtrable por lote) |
| POST | /gastos/ | Registrar gasto |
| PATCH | /gastos/{id} | Editar gasto |
| DELETE | /gastos/{id} | Eliminar gasto |

### Ingresos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | /ingresos/?lote_id=X | Listar ingresos |
| POST | /ingresos/ | Registrar venta |
| PATCH | /ingresos/{id} | Editar venta |
| DELETE | /ingresos/{id} | Eliminar venta |

### Rentabilidad ⭐
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | /rentabilidad/dashboard | Dashboard completo + ranking |
| GET  | /rentabilidad/lote/{id} | Rentabilidad de un lote específico |

## Respuesta del dashboard

```json
{
  "total_ingresos": 29500000,
  "total_gastos": 14800000,
  "ganancia_neta": 14700000,
  "margen_global": 49.8,
  "total_hectareas": 165,
  "lotes_activos": 3,
  "mejor_lote": "Lote Este",
  "ranking": [
    {
      "lote_id": 3,
      "nombre": "Lote Este",
      "cultivo": "Trigo",
      "hectareas": 35,
      "ganancia_por_ha": 144571,
      "margen_porcentaje": 66.9,
      "ranking": 1,
      ...
    }
  ]
}
```

## Planes
- **básico**: hasta 5 lotes (gratis)
- **productor**: lotes ilimitados + exportación PDF/Excel
- **agronomo**: gestión de múltiples productores
