from fastapi import FastAPI
from .database import create_db_and_tables
from .routers import policies, users, evaluate, results
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Policy Compliance Checker - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(policies.router)
app.include_router(users.router)
app.include_router(evaluate.router)
app.include_router(results.router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/sample_policy")
def sample_policy():
    return {
        "id": "password_policy_v1",
        "name": "Password Policy v1",
        "mode": "all_of",
        "rules": [
            {"id":"min_length","attribute":"password_length","operator":">=","value":12,"message":"Password >= 12"},
            {"id":"no_last_7","attribute":"password_last_digit","operator":"!=","value":7,"message":"Last digit != 7"}
        ]
    }
