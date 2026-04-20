#Autor : SHERKO, Data engineer
#Date : 2026-04-20
#Description : HorusSight API


from fastapi import FastAPI

app = FastAPI(
    title="HorusSight - API",
    description="Backend orchestration and AI risk engine for the HorusSight platform.",
    version="1.0.0"
)

@app.get("/")
async def root():
    """
    Root endpoint to verify the API is running.
    """
    return {"message": "Welcome to the HorusSight API - System is online!"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring system status.
    """
    return {
        "status": "ok", 
        "components": {
            "ai_engine": "standby", 
            "orchestrator": "standby"
        }
    }