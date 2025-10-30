from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.types import JSON as SAJSON
from datetime import datetime

class Policy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    raw: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(SAJSON))

class UserRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(SAJSON))
    imported_from: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EvaluationResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    policy_id: int
    passed: bool
    details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(SAJSON))
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
