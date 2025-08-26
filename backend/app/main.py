from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ingest, search, ask

app = FastAPI(
    title="Mini Asistente Q&A",
    description="Sistema de búsqueda y respuesta sobre documentos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/api", tags=["Ingest"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(ask.router, prefix="/api", tags=["Ask"])

@app.get("/")
async def root():
    return {
        "message": "Bienvenido al Mini Asistente Q&A",
        "endpoints": {
            "ingest": "/api/ingest",
            "search": "/api/search?q=consulta",
            "ask": "/api/ask"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}