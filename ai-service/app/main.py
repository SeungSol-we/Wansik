from fastapi import FastAPI

from app.routers import vision

app = FastAPI(title="diet-care ai-service", version="1.0.0")

app.include_router(vision.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
