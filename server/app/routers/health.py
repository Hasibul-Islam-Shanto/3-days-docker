import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["health"])

START_TIME = time.time()

@router.get("/health")
def liveness():
    return {
        "status": "ok",
        "uptime": round(time.time() - START_TIME, 2),
    }

@router.get("/health/deep")
def readiness(db: Session = Depends(get_db)):
    t0 = time.time()
    try:
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - t0) * 1000, 2)
        return {
            "status": "ok",
            "database": {
                "status": "healthy",
                "latencyMs": db_latency_ms,
            },
            "uptime": round(time.time() - START_TIME, 2),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DEPENDENCY_UNAVAILABLE",
                "message": f"Database check failed: {str(e)}",
            },
        )
