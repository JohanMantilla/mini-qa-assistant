# 🧠 Mini Asistente Q&A - Prueba Técnica

Sistema de búsqueda y respuesta sobre documentos usando FastAPI + React + TypeScript.

## 🚀 Funcionalidades Implementadas

### ✅ Backend (FastAPI)
- **POST** `/api/ingest`: Procesa y indexa múltiples archivos (.txt, .pdf)
- **GET** `/api/search?q=...`: Búsqueda con algoritmo BM25 y puntajes de relevancia
- **POST** `/api/ask`: Respuestas en lenguaje natural con citas de respaldo
- **GET** `/health`: Health check del servicio
- **GET** `/api/index/info`: Información del estado del índice

### ✅ Frontend (React + TypeScript)
- **Uploader**: Drag & drop con validaciones robustas
- **Buscador**: Búsqueda en tiempo real con resultados paginados
- **Q&A**: Preguntas en lenguaje natural con respuestas citadas
- **Estado del Índice**: Visualización de documentos indexados en tiempo real

### ✅ Motor de Búsqueda
**Opción Implementada: Clásica (BM25)**
- Indexación de documentos en fragmentos de 300 caracteres
- Algoritmo BM25Okapi para relevancia
- Tokenización con filtros de palabras vacías
- Extracción de respuestas basada en coincidencias de palabras clave

## ⏱️ Tiempo Invertido

**Total: 14 horas** distribuidas en:
- Backend y lógica de búsqueda: 6 horas
- Frontend y componentes: 5 horas
- Docker, persistencia, documentación y refinamientos: 3 horas

## 🛠️ Ejecución

### Prerrequisitos
- Docker y Docker Compose instalados
- Puertos 3000 y 8000 disponibles

### Comando Principal
```bash
docker-compose up
```

### Acceso
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── app/
│   │   ├── main.py              # Configuración FastAPI
│   │   ├── routers/             # Endpoints (ingest, search, ask)
│   │   ├── services/            # Lógica de negocio (DocumentService)
│   │   ├── models/              # Esquemas Pydantic
│   │   └── utils/               # Utilidades (texto, archivos)
│   ├── data/                    # Persistencia del índice
│   ├── tests/                   # Pruebas unitarias
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── uploader/           # Módulo de carga de archivos
│   │   ├── search/             # Módulo de búsqueda
│   │   ├── qa/                 # Módulo Q&A
│   │   ├── indexed-documents/  # Visualización del índice
│   │   └── shared/            # Servicios y utilidades compartidas
│   └── package.json
└── docker-compose.yml
```

## 🔧 Decisiones Técnicas

### Backend
1. **FastAPI**: Elegido por su velocidad, documentación automática y tipado robusto
2. **BM25**: Algoritmo probado para relevancia sin necesidad de modelos externos
3. **Persistencia JSON**: Simple y debuggeable, ideal para el alcance del proyecto
4. **PyPDF2**: Ligero para extracción de texto de PDFs

### Frontend
1. **Arquitectura Modular**: Cada funcionalidad en su propio módulo con hooks, interfaces y estilos
2. **Hooks Personalizados**: Separación de lógica de negocio de componentes UI
3. **TypeScript**: Interfaces bien definidas para mejor mantenibilidad
4. **CSS Vanilla**: Sin dependencias externas, estilos scoped por módulo

### DevOps
1. **Docker Compose**: Orquestación simple de servicios
2. **Volúmenes**: Persistencia de datos entre reinicios
3. **CORS Configurado**: Comunicación frontend-backend sin restricciones

## ⭐ Alcances Deseables Implementados

- ✅ **Citas clicables**: Las citas se pueden hacer clic para resaltarlas
- ✅ **Persistencia del índice**: Guardado automático en `document_index.json`
- ✅ **Rate limiting**: 10 segundos mínimo entre uploads
- ✅ **Validaciones robustas**: Tipo MIME, tamaño (10MB), cantidad (3-10 archivos)

## 🧪 Testing

### Backend
Pruebas unitarias implementadas con pytest, se deben hacer de manera local, instalando cada dependencia:
```bash
cd backend 
pip install -r requirements-test.txt 
pip install -r requirements-test.txt
python -m pytest tests/ -v
```

**Cobertura**:
- Endpoints principales (`test_main.py`, `test_routes.py`)
- Lógica de negocio (`test_document_service.py`)
- Casos edge y manejo de errores

### Frontend
**Estructura preparada** con Vitest y React Testing Library:

```
src/
├── tests/
│   ├── components/
│   ├── hooks/
│   └── services/
```

**Nota sobre Testing Frontend**: 
Los tests están implementados pero no completamente funcionales en el entorno Docker actual debido a configuraciones específicas de Vitest con contenedores. La arquitectura está diseñada para ser fácilmente testeable:

- Lógica de negocio separada en hooks personalizados
- Interfaces TypeScript bien definidas
- Componentes con responsabilidades únicas
- Servicios API mockeables

En un entorno local o CI/CD, los tests funcionarían ejecutando:
```bash
cd frontend
npm test
```

## 🎯 Características Destacadas

1. **UX Mejorada**: Flujo de 2 pasos (seleccionar → procesar) con feedback visual claro
2. **Estado en Tiempo Real**: Actualización automática del estado del índice
3. **Validaciones Progresivas**: Formato → cantidad → tamaño → contenido
4. **Persistencia Transparente**: Los documentos persisten automáticamente entre reinicios
5. **Arquitectura Escalable**: Estructura modular preparada para crecimiento

## 📊 Casos de Uso Probados

1. **Flujo Completo**: Subida → Búsqueda → Pregunta → Respuesta con citas
2. **Persistencia**: Reinicio de Docker con documentos conservados
3. **Validaciones**: Archivos inválidos, cantidades incorrectas, tamaños excesivos
4. **Edge Cases**: Búsquedas sin resultados, preguntas sin información disponible

## 🚨 Limitaciones Conocidas

1. **Escalabilidad**: BM25 en memoria, no optimizado para miles de documentos
2. **Idioma**: Tokenización básica, funciona mejor con español/inglés
3. **Testing Frontend**: Configuración de Vitest pendiente para entorno Docker
4. **Seguridad**: CORS abierto, no apropiado para producción

## 🔮 Próximos Pasos (Fuera del Alcance)

1. Base de datos para persistencia robusta
2. Procesamiento de imágenes en PDFs (OCR)
3. Integración con modelos de lenguaje (OpenAI/Gemini)
4. Autenticación y autorización
5. Tests end-to-end con Playwright
6. Pipeline CI/CD con GitHub Actions

## 📷 Demo

La aplicación permite:
1. Subir 3-10 documentos PDF/TXT con validaciones
2. Buscar contenido específico con puntuaciones de relevancia
3. Hacer preguntas en lenguaje natural
4. Obtener respuestas con citas clickeables del contenido original
5. Ver el estado del índice en tiempo real

---

**Desarrollado con**: FastAPI, React, TypeScript, Docker, BM25, PyPDF2
