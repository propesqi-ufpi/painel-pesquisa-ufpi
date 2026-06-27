import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import projetos, dashboard, auth, finep, producao, bolsistas, nucleos, grupos, incubadas, pos_graduacao, laboratorios

app = FastAPI(
    title="Painel de Pesquisa e Inovação",
    description="API REST do sistema de indicadores de P&D da instituição",
    version="1.0.0",
)

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:3000,http://localhost:5173",
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",")]

class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

app.add_middleware(NoCacheMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projetos.router)
app.include_router(finep.router)
app.include_router(dashboard.router)
app.include_router(producao.router)
app.include_router(bolsistas.router)
app.include_router(nucleos.router)
app.include_router(grupos.router)
app.include_router(incubadas.router)
app.include_router(pos_graduacao.router)
app.include_router(laboratorios.router)


@app.get("/health", tags=["Sistema"])
def health_check():
    """Verifica se a API está no ar."""
    return {"status": "ok", "versao": "1.0.0"}
