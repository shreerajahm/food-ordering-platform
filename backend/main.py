from fastapi import FastAPI

app = FastAPI(title="Food Ordering Platform")


@app.get("/")
def home():
    return {
        "message": "Food Ordering Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }