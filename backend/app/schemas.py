from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PolicyIn(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    raw: Dict[str, Any]

class EvalRequest(BaseModel):
    user_ids: Optional[List[str]] = None
    policy_ids: Optional[List[int]] = None
    evaluate_all_users: Optional[bool] = False
    evaluate_all_policies: Optional[bool] = False
