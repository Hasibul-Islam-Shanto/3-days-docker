from contextlib import asynccontextmanager
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import Base, engine
from app.models import User, Post, Comment  # ensure models are registered
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.posts import router as posts_router
from app.routers.comments import router as comments_router
from app.routers.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables on startup if connection succeeds
    try:
        Base.metadata.create_all(bind=engine)
        print("Database schema verified and initialized.")
    except Exception as e:
        print(f"Warning: Could not connect to database on startup ({e}). Verify DATABASE_URL.")
    yield

app = FastAPI(
    title="Written API",
    description="Monolith REST API for Written blogging platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)

# Custom Error Handlers to guarantee consistent JSON envelope:
# { "error": { "code": "...", "message": "...", "details": ... } }

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail and "message" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "REQUEST_FAILED",
                "message": str(exc.detail) if exc.detail else "Request failed",
                "details": None,
            }
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Format field errors nicely
    details = {}
    for err in errors:
        loc = err.get("loc", [])
        field_name = ".".join(str(x) for x in loc if x not in ("body", "query", "path"))
        details[field_name or "body"] = err.get("msg")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Some fields need attention",
                "details": details,
            }
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Something went wrong. Please try again.",
                "details": str(exc) if settings.ENVIRONMENT == "development" else None,
            }
        },
    )

# Include Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(health_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
