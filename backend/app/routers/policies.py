from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..schemas import PolicyIn
from ..models import Policy
from ..database import get_session
from typing import List

router = APIRouter(prefix="/policies", tags=["policies"])

@router.post("", response_model=dict)
def create_policy(policy_in: PolicyIn, session: Session = Depends(get_session)):
    raw = policy_in.raw
    if not isinstance(raw, dict):
        raise HTTPException(status_code=400, detail="raw must be a JSON object")
    if "rules" not in raw:
        raise HTTPException(status_code=400, detail="policy.raw must contain 'rules' list")
    p = Policy(name=policy_in.name, description=policy_in.description, version=policy_in.version, raw=raw)
    session.add(p)
    session.commit()
    session.refresh(p)
    return {"id": p.id, "name": p.name, "version": p.version}

@router.get("", response_model=List[dict])
def list_policies(session: Session = Depends(get_session)):
    policies = session.exec(select(Policy)).all()
    return [{"id": p.id, "name": p.name, "version": p.version, "raw": p.raw} for p in policies]

@router.get("/{policy_id}", response_model=dict)
def get_policy(policy_id: int, session: Session = Depends(get_session)):
    p = session.get(Policy, policy_id)
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"id": p.id, "name": p.name, "version": p.version, "raw": p.raw}

@router.put("/{policy_id}", response_model=dict)
def update_policy(policy_id: int, policy_in: PolicyIn, session: Session = Depends(get_session)):
    p = session.get(Policy, policy_id)
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    p.name = policy_in.name
    p.description = policy_in.description
    p.version = policy_in.version
    p.raw = policy_in.raw
    session.add(p)
    session.commit()
    session.refresh(p)
    return {"id": p.id, "name": p.name, "version": p.version}
